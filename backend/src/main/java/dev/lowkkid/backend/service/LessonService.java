package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.UserAttempt;
import dev.lowkkid.backend.model.LessonItem;
import dev.lowkkid.backend.model.LessonStatus;
import dev.lowkkid.backend.model.SectionItem;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.QuestionRepository.LessonQuestionCount;
import dev.lowkkid.backend.repository.SectionRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository.LessonCounters;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Homework tab: the list of lesson cards with their padlocks, which come from the schedule the
 * admin set up rather than from how far the student got, and the topics they are grouped under.
 * A test is one more card of the list: it opens on its own date, whatever the lessons of its topic.
 */
@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final SectionRepository sectionRepository;
    private final UserAttemptRepository attemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final SubscriptionAccess subscriptionAccess;

    /**
     * Homework list of a subject, ordered by the admin defined order, each row carrying its lock
     * state for this student.
     *
     * @throws dev.lowkkid.backend.exception.ForbiddenException if the subject is not paid for
     */
    @Transactional(readOnly = true)
    public List<LessonItem> lessonsOf(CurrentUser user, Integer subjectId) {
        subscriptionAccess.requireActive(user.id(), subjectId);

        List<Lesson> lessons = lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId);

        Map<Integer, Long> questionCounts = questionRepository.countByLessonOfSubject(subjectId).stream()
                .collect(Collectors.toMap(LessonQuestionCount::getLessonId, LessonQuestionCount::getCount));
        Map<Integer, UserAttempt> attempts = attemptRepository
                .findByUser_IdAndLesson_Subject_Id(user.id(), subjectId).stream()
                .collect(Collectors.toMap(attempt -> attempt.getLesson().getId(), Function.identity(),
                        (first, second) -> first));
        Map<Integer, Long> correctAnswers = userAnswerRepository.countByLesson(user.id(), subjectId).stream()
                .collect(Collectors.toMap(LessonCounters::getLessonId, LessonCounters::getCorrect));

        List<LessonItem> items = new ArrayList<>(lessons.size());
        for (Lesson lesson : lessons) {
            UserAttempt attempt = attempts.get(lesson.getId());
            items.add(new LessonItem(
                    lesson.getId(),
                    lesson.getTitle(),
                    lesson.getDescription(),
                    lesson.getOrder(),
                    lesson.getOpensAt(),
                    statusOf(lesson, attempt),
                    questionCounts.getOrDefault(lesson.getId(), 0L).intValue(),
                    attempt == null ? null : correctAnswers.getOrDefault(lesson.getId(), 0L).intValue(),
                    lesson.getKind(),
                    lesson.getSection() == null ? null : lesson.getSection().getId()));
        }
        return items;
    }

    /**
     * Topics of a subject in their order, empty ones included; the list of lessons already comes
     * in the same order, so grouping it by {@code sectionId} gives the programme.
     *
     * @throws dev.lowkkid.backend.exception.ForbiddenException if the subject is not paid for
     */
    @Transactional(readOnly = true)
    public List<SectionItem> sectionsOf(CurrentUser user, Integer subjectId) {
        subscriptionAccess.requireActive(user.id(), subjectId);
        return sectionRepository.findBySubject_IdOrderByOrderAsc(subjectId).stream()
                .map(section -> new SectionItem(section.getId(), section.getTitle(), section.getOrder()))
                .toList();
    }

    /**
     * A lesson opens on its date; a started one reports its own state instead, so moving the date
     * of a lesson somebody is already solving does not take it away from them.
     */
    static LessonStatus statusOf(Lesson lesson, UserAttempt attempt) {
        if (attempt != null) {
            return attempt.getCompletedAt() != null ? LessonStatus.COMPLETED : LessonStatus.IN_PROGRESS;
        }
        return LessonAccess.isOpen(lesson) ? LessonStatus.AVAILABLE : LessonStatus.LOCKED;
    }
}
