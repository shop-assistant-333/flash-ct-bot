package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.LessonKind;
import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Subscription;
import dev.lowkkid.backend.entity.UserPracticeStats;
import dev.lowkkid.backend.model.LessonStatsItem;
import dev.lowkkid.backend.model.PeriodStatsDto;
import dev.lowkkid.backend.model.PredictionDto;
import dev.lowkkid.backend.model.StatsDto;
import dev.lowkkid.backend.model.StreakDto;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository.Counters;
import dev.lowkkid.backend.repository.UserAnswerRepository.LessonCounters;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import dev.lowkkid.backend.repository.UserPracticeStatsRepository;
import dev.lowkkid.backend.repository.UserSessionRepository;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.prediction.ScorePredictor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Statistics tab.
 *
 * <p>Homework only. Practice was left out of the counters on purpose — it is unlimited and
 * repeatable, so counting it would say more about how much time somebody had than about how well
 * they know the subject. The one thing it contributes is the streak.
 *
 * <p>Everything here stays readable once the paid period is over: a student should not lose the
 * history of what they solved because a subscription lapsed.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final LessonRepository lessonRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserAttemptRepository attemptRepository;
    private final UserSessionRepository sessionRepository;
    private final UserPracticeStatsRepository practiceStatsRepository;
    private final SubscriptionAccess subscriptionAccess;
    private final ScorePredictor scorePredictor;

    /** Window the estimate reasons over, so that recent progress outweighs early mistakes. */
    @Value("${app.stats.prediction-window}")
    private Duration predictionWindow;

    /** Below this many recent answers there is nothing to reason about and the score stays null. */
    @Value("${app.stats.prediction-min-answers:20}")
    private int predictionMinAnswers;

    /**
     * Latest estimate produced for each student/subject, alongside the answer counts it was
     * produced from. A new answer makes the stored key stop matching the current one, which marks
     * the entry stale without discarding it: the stale estimate keeps being served instantly while
     * a fresh one is computed in the background, so a request never blocks on the model.
     */
    private final Map<StudentKey, CacheEntry> predictions = new ConcurrentHashMap<>();

    /** Students currently being re-estimated, so a burst of requests doesn't queue up N model calls. */
    private final Set<StudentKey> refreshing = ConcurrentHashMap.newKeySet();

    /**
     * The model call is the slow part, not this pool: virtual threads are cheap enough that one per
     * in-flight refresh needs no bound of its own.
     */
    private final ExecutorService predictionExecutor = Executors.newVirtualThreadPerTaskExecutor();

    @PreDestroy
    void shutdownPredictionExecutor() {
        predictionExecutor.shutdown();
    }

    @Override
    @Transactional(readOnly = true)
    public StatsDto statsOf(CurrentUser user, Integer subjectId) {
        subscriptionAccess.require(user.id(), subjectId);

        List<Lesson> lessons = lessonRepository.findBySubject_IdAndKindOrderByOrderAsc(subjectId, LessonKind.LESSON);
        return new StatsDto(
                subjectId,
                toPeriod(userAnswerRepository.countAll(user.id(), subjectId)),
                toPeriod(userAnswerRepository.countSince(user.id(), subjectId, windowStart())),
                lessonsCompleted(user.id(), subjectId),
                lessons.size(),
                sessionRepository.totalSecondsSpent(user.id()) / 60,
                streak(user.id()),
                byLesson(user.id(), subjectId, lessons));
    }

    /**
     * Never blocks on the model. A fresh estimate is either already cached, or gets computed on a
     * background thread while this call returns immediately with whatever it can: the previous
     * (stale) estimate if one exists, otherwise a {@code pending} placeholder. The caller is
     * expected to poll again shortly while {@code pending} is {@code true}.
     */
    @Override
    public PredictionDto prediction(CurrentUser user, Integer subjectId) {
        Subscription subscription = subscriptionAccess.require(user.id(), subjectId);
        Counters window = userAnswerRepository.countSince(user.id(), subjectId, windowStart());

        if (window.getAnswered() < predictionMinAnswers) {
            return new PredictionDto(subjectId, null, notEnoughData(window), null, false);
        }

        StudentKey studentKey = new StudentKey(user.id(), subjectId);
        PredictionKey key = new PredictionKey(user.id(), subjectId, window.getAnswered(), window.getCorrect());
        CacheEntry entry = predictions.get(studentKey);

        if (entry != null && entry.key().equals(key)) {
            return entry.dto();
        }

        if (refreshing.add(studentKey)) {
            String subjectName = subscription.getSubject().getName();
            predictionExecutor.execute(() -> refresh(user.id(), subjectId, subjectName, studentKey, key, window));
        }

        if (entry != null) {
            return pending(entry.dto());
        }
        return new PredictionDto(subjectId, null, "Считаем прогноз, обновите через несколько секунд", null, true);
    }

    /**
     * Runs off the request thread; failures are logged and swallowed so a flaky model call never
     * surfaces past whichever estimate is already cached - the next poll simply retries.
     */
    private void refresh(Integer userId, Integer subjectId, String subjectName,
                         StudentKey studentKey, PredictionKey key, Counters window) {
        try {
            List<Lesson> lessons = lessonRepository.findBySubject_IdAndKindOrderByOrderAsc(subjectId, LessonKind.LESSON);
            ScorePredictor.Prediction prediction = scorePredictor.predict(new ScorePredictor.Input(
                    subjectName,
                    (int) predictionWindow.toDays(),
                    toPeriod(window),
                    byLesson(userId, subjectId, lessons),
                    lessonsCompleted(userId, subjectId),
                    lessons.size()));

            PredictionDto result = new PredictionDto(
                    subjectId, prediction.score(), prediction.comment(), LocalDateTime.now(), false);
            predictions.put(studentKey, new CacheEntry(key, result));
        } catch (Exception exception) {
            log.warn("Background score prediction failed for user {} subject {}", userId, subjectId, exception);
        } finally {
            refreshing.remove(studentKey);
        }
    }

    private static PredictionDto pending(PredictionDto stale) {
        return new PredictionDto(stale.subjectId(), stale.score(), stale.comment(), stale.computedAt(), true);
    }

    /** Every lesson of the subject, untouched ones included: a blank topic is a result too. */
    private List<LessonStatsItem> byLesson(Integer userId, Integer subjectId, List<Lesson> lessons) {
        Map<Integer, LessonCounters> counters = userAnswerRepository.countByLesson(userId, subjectId).stream()
                .collect(Collectors.toMap(LessonCounters::getLessonId, counter -> counter));

        List<LessonStatsItem> items = new ArrayList<>(lessons.size());
        for (Lesson lesson : lessons) {
            LessonCounters counter = counters.get(lesson.getId());
            long answered = counter == null ? 0 : counter.getAnswered();
            long correct = counter == null ? 0 : counter.getCorrect();
            items.add(new LessonStatsItem(lesson.getId(), lesson.getTitle(), (int) correct, (int) answered,
                    AttemptService.accuracyPercent(correct, answered)));
        }
        return items;
    }

    private int lessonsCompleted(Integer userId, Integer subjectId) {
        return attemptRepository.countCompletedBySubject(userId).stream()
                .filter(count -> count.getSubjectId().equals(subjectId))
                .mapToInt(count -> (int) count.getCount())
                .findFirst()
                .orElse(0);
    }

    private StreakDto streak(Integer userId) {
        return practiceStatsRepository.findById(userId)
                .map(StatsServiceImpl::toStreak)
                .orElseGet(() -> new StreakDto(0, 0));
    }

    private LocalDateTime windowStart() {
        return LocalDateTime.now().minus(predictionWindow);
    }

    private String notEnoughData(Counters window) {
        return "Пока мало данных для прогноза: за последние " + predictionWindow.toDays()
                + " дней решено " + window.getAnswered() + " заданий из " + predictionMinAnswers
                + " нужных. Решите ещё несколько уроков.";
    }

    private static PeriodStatsDto toPeriod(Counters counters) {
        return new PeriodStatsDto(
                (int) counters.getAnswered(),
                (int) counters.getCorrect(),
                AttemptService.accuracyPercent(counters.getCorrect(), counters.getAnswered()));
    }

    private static StreakDto toStreak(UserPracticeStats stats) {
        return new StreakDto(
                stats.getCurrentStreak() == null ? 0 : stats.getCurrentStreak(),
                stats.getBestStreak() == null ? 0 : stats.getBestStreak());
    }

    /** What a cached estimate was produced from: a new answer changes this and stales the entry. */
    private record PredictionKey(Integer userId, Integer subjectId, long answered, long correct) {
    }

    /** Identifies a student/subject regardless of how many answers they currently have. */
    private record StudentKey(Integer userId, Integer subjectId) {
    }

    private record CacheEntry(PredictionKey key, PredictionDto dto) {
    }
}
