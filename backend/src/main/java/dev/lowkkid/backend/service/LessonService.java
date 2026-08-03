package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.UserAttempt;
import dev.lowkkid.backend.model.LessonItem;
import dev.lowkkid.backend.model.LessonStatus;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.QuestionRepository.LessonQuestionCount;
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
 * Homework tab: the list of lesson cards with their padlocks.
 */
@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final UserAttemptRepository attemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final SubscriptionAccess subscriptionAccess;
    private final ProgressService progressService;

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
        int unlockedThrough = progressService.unlockedThrough(user.id(), subjectId, lessons);

        Map<Integer, Long> questionCounts = questionRepository.countByLessonOfSubject(subjectId).stream()
                .collect(Collectors.toMap(LessonQuestionCount::getLessonId, LessonQuestionCount::getCount));
        Map<Integer, UserAttempt> attempts = attemptRepository
                .findByUser_IdAndLesson_Subject_Id(user.id(), subjectId).stream()
                .collect(Collectors.toMap(attempt -> attempt.getLesson().getId(), Function.identity(),
                        (first, second) -> first));
        Map<Integer, Long> correctAnswers = userAnswerRepository.countByLesson(user.id(), subjectId).stream()
                .collect(Collectors.toMap(LessonCounters::getLessonId, LessonCounters::getCorrect));

        List<LessonItem> items = new ArrayList<>(lessons.size());
        for (int index = 0; index < lessons.size(); index++) {
            Lesson lesson = lessons.get(index);
            UserAttempt attempt = attempts.get(lesson.getId());
            items.add(new LessonItem(
                    lesson.getId(),
                    lesson.getTitle(),
                    lesson.getDescription(),
                    lesson.getOrder(),
                    statusOf(index, unlockedThrough, attempt),
                    questionCounts.getOrDefault(lesson.getId(), 0L).intValue(),
                    attempt == null ? null : correctAnswers.getOrDefault(lesson.getId(), 0L).intValue()));
        }
        return items;
    }

    /** Everything up to the current lesson is open; a started lesson also reports its own state. */
    static LessonStatus statusOf(int lessonIndex, int unlockedThrough, UserAttempt attempt) {
        if (attempt != null) {
            return attempt.getCompletedAt() != null ? LessonStatus.COMPLETED : LessonStatus.IN_PROGRESS;
        }
        return lessonIndex <= unlockedThrough ? LessonStatus.AVAILABLE : LessonStatus.LOCKED;
    }
}
