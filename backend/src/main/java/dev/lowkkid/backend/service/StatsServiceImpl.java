package dev.lowkkid.backend.service;

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

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
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
     * Estimates already produced, keyed by what they were produced from: a new answer changes the
     * key and therefore the estimate, while reopening the tab costs nothing.
     */
    private final Map<PredictionKey, PredictionDto> predictions = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public StatsDto statsOf(CurrentUser user, Integer subjectId) {
        subscriptionAccess.require(user.id(), subjectId);

        List<Lesson> lessons = lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId);
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
     * Deliberately not wrapped in a transaction of its own: the call to the model can take
     * seconds, and holding a database connection open for the whole of it would be paid for by
     * every other request.
     */
    @Override
    public PredictionDto prediction(CurrentUser user, Integer subjectId) {
        Subscription subscription = subscriptionAccess.require(user.id(), subjectId);
        Counters window = userAnswerRepository.countSince(user.id(), subjectId, windowStart());

        if (window.getAnswered() < predictionMinAnswers) {
            return new PredictionDto(subjectId, null, notEnoughData(window), LocalDateTime.now());
        }

        PredictionKey key = new PredictionKey(user.id(), subjectId, window.getAnswered(), window.getCorrect());
        PredictionDto cached = predictions.get(key);
        if (cached != null) {
            return cached;
        }

        List<Lesson> lessons = lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId);
        ScorePredictor.Prediction prediction = scorePredictor.predict(new ScorePredictor.Input(
                subscription.getSubject().getName(),
                (int) predictionWindow.toDays(),
                toPeriod(window),
                byLesson(user.id(), subjectId, lessons),
                lessonsCompleted(user.id(), subjectId),
                lessons.size()));

        PredictionDto result = new PredictionDto(
                subjectId, prediction.score(), prediction.comment(), LocalDateTime.now());
        predictions.keySet().removeIf(stored -> stored.sameStudent(key));
        predictions.put(key, result);
        return result;
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

    private record PredictionKey(Integer userId, Integer subjectId, long answered, long correct) {

        private boolean sameStudent(PredictionKey other) {
            return userId.equals(other.userId()) && subjectId.equals(other.subjectId());
        }
    }
}
