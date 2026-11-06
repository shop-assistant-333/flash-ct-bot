package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.LessonKind;
import dev.lowkkid.backend.entity.Section;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.ErrorCode;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.LessonRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.QuestionRepository.LessonQuestionCount;
import dev.lowkkid.backend.repository.SectionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Lessons and tests of a subject: the topic each one is under, the order they are listed in and the
 * date every one of them opens on.
 *
 * <p>The order is not a free number: it is unique per subject in the database and always reads
 * the programme top to bottom (see {@link ProgramOrder}). Every write here therefore ends with the
 * whole subject renumbered to a clean {@code 1..n}, so a gap or a duplicate can never appear in
 * the first place. What the students may open is a separate matter and comes from {@code opensAt}
 * alone — a test too, whatever the lessons of its topic.
 */
@Service
@RequiredArgsConstructor
public class AdminLessonServiceImpl implements AdminLessonService {

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final ProgramOrder programOrder;
    private final UserAttemptRepository attemptRepository;
    private final UserAnswerRepository answerRepository;
    private final AdminContentMapper contentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AdminLessonItem> findBySubject(Integer subjectId) {
        return toItems(lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId), subjectId);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminLessonDto get(Integer lessonId) {
        Lesson lesson = lesson(lessonId);
        return contentMapper.toLesson(lesson, questionRepository.findByLesson_IdOrderByOrderAsc(lessonId));
    }

    @Override
    @Transactional
    public AdminLessonDto create(LessonRequest request) {
        Subject subject = subject(request.subjectId());
        LessonKind kind = request.kind() == null ? LessonKind.LESSON : request.kind();
        Section section = section(request.sectionId(), subject.getId());
        requireRoomForTest(kind, section, null);

        Lesson lesson = new Lesson();
        lesson.setSubject(subject);
        lesson.setTitle(request.title().trim());
        lesson.setDescription(request.description());
        lesson.setOpensAt(request.opensAt());
        lesson.setKind(kind);
        lesson.setSection(section);
        lesson.setOrder(null);
        lessonRepository.save(lesson);

        placeAt(lesson, subject.getId(), request.order());
        return contentMapper.toLesson(lesson, List.of());
    }

    /**
     * Also moves the lesson between topics and subjects, renumbering both sides so neither is left
     * ragged. A lesson moved to another subject has to name a topic of that subject, or none.
     */
    @Override
    @Transactional
    public AdminLessonDto update(Integer lessonId, LessonRequest request) {
        Lesson lesson = lesson(lessonId);
        Integer previousSubjectId = lesson.getSubject().getId();
        LessonKind kind = request.kind() == null ? lesson.getKind() : request.kind();
        Section section = section(request.sectionId(), request.subjectId());
        requireRoomForTest(kind, section, lessonId);

        lesson.setKind(kind);
        lesson.setSection(section);
        lesson.setTitle(request.title().trim());
        lesson.setDescription(request.description());
        lesson.setOpensAt(request.opensAt());
        if (!previousSubjectId.equals(request.subjectId())) {
            lesson.setSubject(subject(request.subjectId()));
        }
        lessonRepository.save(lesson);

        boolean moved = !previousSubjectId.equals(request.subjectId());
        if (moved) {
            programOrder.arrange(previousSubjectId, others(previousSubjectId, lessonId));
        }
        // An omitted order means "leave it where it is", unlike on create where it means "append".
        Integer wantedOrder = request.order() == null && !moved ? lesson.getOrder() : request.order();
        placeAt(lesson, request.subjectId(), wantedOrder);

        return contentMapper.toLesson(lesson, questionRepository.findByLesson_IdOrderByOrderAsc(lessonId));
    }

    /**
     * Deletes the lesson whether or not students have solved it: their attempts and answers go
     * with it. The foreign keys carry no cascade in the database, so the history is removed by
     * hand, deepest rows first, before the lesson takes its own questions down.
     */
    @Override
    @Transactional
    public void delete(Integer lessonId) {
        Lesson lesson = lesson(lessonId);

        // Answers to a question that was moved into this lesson sit in an attempt of another
        // lesson, so they are not reached by deleting the attempts below.
        answerRepository.deleteAll(answerRepository.findByQuestion_Lesson_Id(lessonId));
        answerRepository.flush();
        attemptRepository.deleteAll(attemptRepository.findByLesson_Id(lessonId));
        attemptRepository.flush();

        Integer subjectId = lesson.getSubject().getId();
        lessonRepository.delete(lesson);
        lessonRepository.flush();
        programOrder.arrange(subjectId);
    }

    @Override
    @Transactional
    public List<AdminLessonItem> reorder(Integer subjectId, List<Integer> lessonIds) {
        List<Lesson> lessons = lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId);
        Map<Integer, Lesson> byId = lessons.stream()
                .collect(Collectors.toMap(Lesson::getId, lesson -> lesson));

        if (lessonIds.size() != lessons.size() || !byId.keySet().containsAll(lessonIds)) {
            throw new BadRequestException("Reorder must list every lesson of subject " + subjectId + " exactly once");
        }

        List<Lesson> reordered = lessonIds.stream().distinct().map(byId::get).toList();
        if (reordered.size() != lessons.size()) {
            throw new BadRequestException("Reorder lists a lesson of subject " + subjectId + " twice");
        }

        return toItems(programOrder.arrange(subjectId, reordered), subjectId);
    }

    /**
     * Puts the lesson at the wanted position of its subject, or at the end when none was given; the
     * topic then pulls it into its own block, so "the end" is the end of its topic.
     */
    private void placeAt(Lesson lesson, Integer subjectId, Integer wantedOrder) {
        List<Lesson> siblings = others(subjectId, lesson.getId());
        int index = wantedOrder == null
                ? siblings.size()
                : Math.clamp(wantedOrder - 1L, 0, siblings.size());

        List<Lesson> sequence = new ArrayList<>(siblings);
        sequence.add(index, lesson);
        programOrder.arrange(subjectId, sequence);
    }

    private List<Lesson> others(Integer subjectId, Integer excludedLessonId) {
        return lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId).stream()
                .filter(lesson -> !lesson.getId().equals(excludedLessonId))
                .toList();
    }

    private List<AdminLessonItem> toItems(List<Lesson> lessons, Integer subjectId) {
        Map<Integer, Long> questionCounts = questionRepository.countByLessonOfSubject(subjectId).stream()
                .collect(Collectors.toMap(LessonQuestionCount::getLessonId, LessonQuestionCount::getCount));
        return lessons.stream()
                .map(lesson -> contentMapper.toItem(
                        lesson, questionCounts.getOrDefault(lesson.getId(), 0L).intValue()))
                .toList();
    }

    private Lesson lesson(Integer lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> NotFoundException.of("Lesson", lessonId));
    }

    /**
     * The topic a lesson goes under, which has to be a topic of the lesson's subject. A missing
     * topic and a foreign one get the same answer, so a teacher cannot probe the ids of others.
     */
    private Section section(Integer sectionId, Integer subjectId) {
        if (sectionId == null) {
            return null;
        }
        return sectionRepository.findById(sectionId)
                .filter(section -> section.getSubject().getId().equals(subjectId))
                .orElseThrow(() -> new BadRequestException(
                        "Section " + sectionId + " does not belong to subject " + subjectId));
    }

    /** One test per topic; a test outside every topic is not limited. */
    private void requireRoomForTest(LessonKind kind, Section section, Integer lessonId) {
        if (kind != LessonKind.TEST || section == null) {
            return;
        }
        // A lesson being created has no id yet, and no real lesson has id 0 to collide with.
        if (lessonRepository.hasOtherTest(section.getId(), lessonId == null ? 0 : lessonId)) {
            throw new ConflictException(ErrorCode.SECTION_HAS_TEST,
                    "Section " + section.getId() + " already has a test");
        }
    }

    private Subject subject(Integer subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> NotFoundException.of("Subject", subjectId));
    }
}
