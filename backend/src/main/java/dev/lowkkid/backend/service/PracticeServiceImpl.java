package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.UserPracticeStats;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.PracticeAnswerResultDto;
import dev.lowkkid.backend.model.PracticeQuestionDto;
import dev.lowkkid.backend.model.StreakDto;
import dev.lowkkid.backend.model.SubmitAnswerRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.UserPracticeStatsRepository;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Practice tab.
 *
 * <p>The deck is runtime state on purpose: the order of the questions has to survive moving
 * between tabs but not the app being closed, so it lives in memory next to the session it belongs
 * to instead of in a table. A visit that goes stale takes its deck with it, and the next launch
 * gets a freshly shuffled one.
 *
 * <p>The streak is the opposite: it is the one thing practice contributes to the statistics, so it
 * is stored and only ever reset by a wrong answer.
 */
@Service
@RequiredArgsConstructor
public class PracticeServiceImpl implements PracticeService {

    /** Practice before {@code /session/start} ever ran; the deck is still kept per user. */
    private static final long NO_SESSION = -1L;
    /** A deck nobody touched for this long belongs to a visit that is long over. */
    private static final Duration DECK_TTL = Duration.ofHours(2);

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final UserPracticeStatsRepository practiceStatsRepository;
    private final SubscriptionAccess subscriptionAccess;
    private final ProgressService progressService;
    private final SessionService sessionService;
    private final AnswerGrader answerGrader;
    private final ContentMapper contentMapper;

    private final Map<DeckKey, Deck> decks = new ConcurrentHashMap<>();

    @Override
    @Transactional(readOnly = true)
    public PracticeQuestionDto next(CurrentUser user, Integer subjectId) {
        subscriptionAccess.requireActive(user.id(), subjectId);

        Deck deck = deckOf(user.id(), subjectId);
        Question question = currentQuestion(user.id(), subjectId, deck);
        return new PracticeQuestionDto(
                subjectId,
                contentMapper.toQuestion(question),
                toDto(practiceStats(user.id()).orElse(null)),
                deck.position(),
                deck.size());
    }

    /**
     * Only the current card can be answered: the cursor is what keeps a reload from skipping a
     * question, so an answer to anything else is a stale screen rather than progress.
     */
    @Override
    @Transactional
    public PracticeAnswerResultDto answer(CurrentUser user, Integer subjectId, SubmitAnswerRequest request) {
        subscriptionAccess.requireActive(user.id(), subjectId);

        Deck deck = deckOf(user.id(), subjectId);
        Question question = currentQuestion(user.id(), subjectId, deck);
        if (!question.getId().equals(request.questionId())) {
            throw new BadRequestException("Question " + request.questionId()
                    + " is not the one being practised, expected " + question.getId());
        }

        AnswerGrader.Graded graded = answerGrader.grade(question, request);
        StreakDto streak = toDto(moveStreak(user.id(), graded.correct()));
        deck.advance();

        return new PracticeAnswerResultDto(answerGrader.toResult(graded, false), streak);
    }

    @Override
    @Transactional(readOnly = true)
    public StreakDto streak(CurrentUser user) {
        return toDto(practiceStats(user.id()).orElse(null));
    }

    /**
     * Deck of the current visit, rebuilt whenever the student comes back after the previous one
     * has ended.
     */
    private Deck deckOf(Integer userId, Integer subjectId) {
        long sessionId = sessionService.currentSessionId(userId).orElse(NO_SESSION);
        DeckKey key = new DeckKey(userId, subjectId);

        Deck deck = decks.get(key);
        if (deck == null || deck.sessionId() != sessionId) {
            deck = new Deck(sessionId, shuffledQuestionIds(userId, subjectId));
            forgetStaleDecks();
            decks.put(key, deck);
        }
        deck.touch();
        return deck;
    }

    /**
     * Everything the student is allowed to practise on: the questions of the lessons already open
     * to them plus the extra questions the admin put straight into the subject.
     */
    private List<Integer> shuffledQuestionIds(Integer userId, Integer subjectId) {
        List<Lesson> ordered = lessonRepository.findBySubject_IdOrderByOrderAsc(subjectId);
        int unlockedThrough = progressService.unlockedThrough(userId, subjectId, ordered);

        List<Integer> ids = new ArrayList<>();
        if (unlockedThrough >= 0) {
            List<Integer> unlockedLessonIds = ordered.subList(0, Math.min(unlockedThrough + 1, ordered.size()))
                    .stream()
                    .map(Lesson::getId)
                    .toList();
            questionRepository.findByLesson_IdIn(unlockedLessonIds).forEach(question -> ids.add(question.getId()));
        }
        questionRepository.findBySubject_IdOrderByIdAsc(subjectId).forEach(question -> ids.add(question.getId()));

        if (ids.isEmpty()) {
            throw NotFoundException.practiceDeckEmpty(subjectId);
        }
        Collections.shuffle(ids);
        return ids;
    }

    /**
     * Question under the cursor. A question the admin deleted mid visit is dropped from the deck
     * rather than failing the call.
     */
    private Question currentQuestion(Integer userId, Integer subjectId, Deck deck) {
        while (!deck.isEmpty()) {
            Integer questionId = deck.current();
            Optional<Question> question = questionRepository.findWithOptionsById(questionId);
            if (question.isPresent()) {
                return question.get();
            }
            deck.drop(questionId);
        }
        decks.remove(new DeckKey(userId, subjectId));
        throw NotFoundException.practiceDeckEmpty(subjectId);
    }

    /** Correct answers add up across visits; a wrong one takes the streak back to zero. */
    private UserPracticeStats moveStreak(Integer userId, boolean correct) {
        UserPracticeStats stats = practiceStats(userId).orElseGet(() -> newStats(userId));
        int current = correct ? current(stats) + 1 : 0;
        stats.setCurrentStreak(current);
        if (current > best(stats)) {
            stats.setBestStreak(current);
        }
        return practiceStatsRepository.save(stats);
    }

    private Optional<UserPracticeStats> practiceStats(Integer userId) {
        return practiceStatsRepository.findById(userId);
    }

    private UserPracticeStats newStats(Integer userId) {
        UserPracticeStats stats = new UserPracticeStats();
        stats.setUser(userRepository.getReferenceById(userId));
        stats.setCurrentStreak(0);
        stats.setBestStreak(0);
        return stats;
    }

    private static StreakDto toDto(UserPracticeStats stats) {
        return stats == null ? new StreakDto(0, 0) : new StreakDto(current(stats), best(stats));
    }

    private static int current(UserPracticeStats stats) {
        return stats.getCurrentStreak() == null ? 0 : stats.getCurrentStreak();
    }

    private static int best(UserPracticeStats stats) {
        return stats.getBestStreak() == null ? 0 : stats.getBestStreak();
    }

    /** Keeps the map from growing with decks of visits that ended long ago. */
    private void forgetStaleDecks() {
        Instant deadline = Instant.now().minus(DECK_TTL);
        decks.values().removeIf(deck -> deck.touchedAt().isBefore(deadline));
    }

    private record DeckKey(Integer userId, Integer subjectId) {
    }

    /**
     * Shuffled question ids of one visit with the cursor into them. Running past the end starts
     * the same order over, which is what makes the feed endless.
     */
    private static final class Deck {

        private final long sessionId;
        private final List<Integer> questionIds;
        private int cursor;
        private volatile Instant touchedAt = Instant.now();

        private Deck(long sessionId, List<Integer> questionIds) {
            this.sessionId = sessionId;
            this.questionIds = new ArrayList<>(questionIds);
        }

        private synchronized Integer current() {
            return questionIds.get(cursor % questionIds.size());
        }

        private synchronized void advance() {
            cursor = (cursor + 1) % questionIds.size();
        }

        private synchronized void drop(Integer questionId) {
            questionIds.remove(questionId);
            if (!questionIds.isEmpty()) {
                cursor %= questionIds.size();
            }
        }

        private synchronized boolean isEmpty() {
            return questionIds.isEmpty();
        }

        private synchronized int size() {
            return questionIds.size();
        }

        /** 1 based, so the frontend can show it as "card N of the deck". */
        private synchronized int position() {
            return questionIds.isEmpty() ? 0 : cursor % questionIds.size() + 1;
        }

        private long sessionId() {
            return sessionId;
        }

        private Instant touchedAt() {
            return touchedAt;
        }

        private void touch() {
            touchedAt = Instant.now();
        }
    }
}
