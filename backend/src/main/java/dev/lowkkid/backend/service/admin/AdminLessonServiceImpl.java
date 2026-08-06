package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.LessonRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.QuestionRepository.LessonQuestionCount;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Lessons of a subject: the order they are listed in and the date every one of them opens on.
 *
 * <p>The order is not a free number: it is unique per subject in the database. Every write here
 * therefore ends with the whole subject renumbered to a clean {@code 1..n}, so a gap or a
 * duplicate can never appear in the first place. What the students may open is a separate matter
 * and comes from {@code opensAt} alone.
 */
@Service
@RequiredArgsConstructor
public class AdminLessonServiceImpl implements AdminLessonService {

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final UserAttemptRepository attemptRepository;
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

        Lesson lesson = new Lesson();
        lesson.setSubject(subject);
        lesson.setTitle(request.title().trim());
        lesson.setDescription(request.description());
        lesson.setOpensAt(request.opensAt());
        lesson.setOrder(null);
        lessonRepository.save(lesson);

        placeAt(lesson, subject.getId(), request.order());
        return contentMapper.toLesson(lesson, List.of());
    }

    /** Also moves the lesson between subjects, renumbering both sides so neither is left ragged. */
    @Override
    @Transactional
    public AdminLessonDto update(Integer lessonId, LessonRequest request) {
        Lesson lesson = lesson(lessonId);
        Integer previousSubjectId = lesson.getSubject().getId();

        lesson.setTitle(request.title().trim());
        lesson.setDescription(request.description());
        lesson.setOpensAt(request.opensAt());
        if (!previousSubjectId.equals(request.subjectId())) {
            lesson.setSubject(subject(request.subjectId()));
        }
        lessonRepository.save(lesson);

        boolean moved = !previousSubjectId.equals(request.subjectId());
        if (moved) {
            resequence(others(previousSubjectId, lessonId));
        }
        // An omitted order means "leave it where it is", unlike on create where it means "append".
        Integer wantedOrder = request.order() == null && !moved ? lesson.getOrder() : request.order();
        placeAt(lesson, request.subjectId(), wantedOrder);

        return contentMapper.toLesson(lesson, questionRepository.findByLesson_IdOrderByOrderAsc(lessonId));
    }

    /**
     * @throws ConflictException if a student has already opened the lesson; dropping it would
     *                           erase their attempts along with it
     */
    @Override
    @Transactional
    public void delete(Integer lessonId) {
        Lesson lesson = lesson(lessonId);
        if (attemptRepository.existsByLesson_Id(lessonId)) {
            throw new ConflictException("Lesson " + lessonId + " has already been solved by students");
        }

        Integer subjectId = lesson.getSubject().getId();
        lessonRepository.delete(lesson);
        lessonRepository.flush();
        resequence(lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId));
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

        resequence(reordered);
        return toItems(reordered, subjectId);
    }

    /** Puts the lesson at the wanted position of its subject, or at the end when none was given. */
    private void placeAt(Lesson lesson, Integer subjectId, Integer wantedOrder) {
        List<Lesson> siblings = others(subjectId, lesson.getId());
        int index = wantedOrder == null
                ? siblings.size()
                : Math.clamp(wantedOrder - 1L, 0, siblings.size());

        List<Lesson> sequence = new ArrayList<>(siblings);
        sequence.add(index, lesson);
        resequence(sequence);
    }

    private List<Lesson> others(Integer subjectId, Integer excludedLessonId) {
        return lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId).stream()
                .filter(lesson -> !lesson.getId().equals(excludedLessonId))
                .toList();
    }

    /**
     * Rewrites the positions to {@code 1..n}. The order is unique per subject in the database, so
     * the rows are first parked on negative positions no real lesson uses: assigning the final
     * numbers straight away would collide with the rows still holding them.
     */
    private void resequence(List<Lesson> inWantedOrder) {
        for (int index = 0; index < inWantedOrder.size(); index++) {
            inWantedOrder.get(index).setOrder(-(index + 1));
        }
        lessonRepository.saveAll(inWantedOrder);
        lessonRepository.flush();

        for (int index = 0; index < inWantedOrder.size(); index++) {
            inWantedOrder.get(index).setOrder(index + 1);
        }
        lessonRepository.saveAll(inWantedOrder);
        lessonRepository.flush();
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

    private Subject subject(Integer subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> NotFoundException.of("Subject", subjectId));
    }
}
