package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.AnswerOption;
import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserAnswer;
import dev.lowkkid.backend.entity.UserAttempt;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.ErrorCode;
import dev.lowkkid.backend.exception.ForbiddenException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.AnswerDto;
import dev.lowkkid.backend.model.AnswerResultDto;
import dev.lowkkid.backend.model.AttemptDto;
import dev.lowkkid.backend.model.AttemptResultDto;
import dev.lowkkid.backend.model.LessonStatus;
import dev.lowkkid.backend.model.SubmitAnswerRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * A lesson is solved once: starting it again resumes the same attempt, and a finished one is
 * returned read only for review.
 *
 * <p>Every answer is written down as it arrives, which is what makes the progress survive the
 * student closing telegram in the middle of a test.
 */
@Service
@RequiredArgsConstructor
public class AttemptService {

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final UserAttemptRepository attemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final SubscriptionAccess subscriptionAccess;
    private final ProgressService progressService;
    private final AnswerGrader answerGrader;
    private final ContentMapper contentMapper;

    /**
     * Starts the lesson, or resumes the existing attempt with every answer already given.
     *
     * @throws ForbiddenException if the lesson is locked or the subject is not paid for
     */
    @Transactional
    public AttemptDto startOrResume(CurrentUser user, Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> NotFoundException.of("Lesson", lessonId));
        Subject subject = lesson.getSubject();
        subscriptionAccess.requireActive(user.id(), subject.getId());

        User student = userRepository.findById(user.id())
                .orElseThrow(() -> NotFoundException.of("User", user.id()));
        List<Lesson> ordered = lessonRepository.findBySubject_IdOrderByOrderAsc(subject.getId());
        int unlockedThrough = progressService.unlockedThroughOrStart(student, subject, ordered);
        if (progressService.indexOf(ordered, lessonId) > unlockedThrough) {
            throw ForbiddenException.lessonLocked(lessonId);
        }

        UserAttempt attempt = attemptRepository
                .findFirstByUser_IdAndLesson_IdOrderByStartedAtDesc(user.id(), lessonId)
                .orElseGet(() -> open(student, lesson));
        return toDto(attempt, lesson);
    }

    /** Current state of an attempt of this user. */
    @Transactional(readOnly = true)
    public AttemptDto get(CurrentUser user, Long attemptId) {
        UserAttempt attempt = ownedAttempt(user, attemptId);
        return toDto(attempt, attempt.getLesson());
    }

    /**
     * Records an answer and returns the verdict with the explanation of the question.
     *
     * @throws ConflictException if the attempt is finished or the question was already answered
     */
    @Transactional
    public AnswerResultDto submitAnswer(CurrentUser user, Long attemptId, SubmitAnswerRequest request) {
        UserAttempt attempt = ownedAttempt(user, attemptId);
        if (attempt.getCompletedAt() != null) {
            throw new ConflictException(ErrorCode.ATTEMPT_ALREADY_COMPLETED,
                    "Attempt " + attemptId + " is already completed");
        }

        List<Question> questions = questionsOf(attempt.getLesson());
        Question question = questions.stream()
                .filter(candidate -> candidate.getId().equals(request.questionId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Question " + request.questionId()
                        + " does not belong to lesson " + attempt.getLesson().getId()));
        if (userAnswerRepository.existsByAttempt_IdAndQuestion_Id(attemptId, question.getId())) {
            throw new ConflictException(ErrorCode.QUESTION_ALREADY_ANSWERED,
                    "Question " + question.getId() + " is already answered in attempt " + attemptId);
        }

        AnswerGrader.Graded graded = answerGrader.grade(question, request);
        UserAnswer answer = new UserAnswer();
        answer.setAttempt(attempt);
        answer.setQuestion(question);
        answer.setAnswerText(graded.answerText());
        answer.setCorrect(graded.correct());
        answer.setAnsweredAt(LocalDateTime.now());
        answer.setSelectedOptions(new LinkedHashSet<>(graded.selectedOptions()));
        userAnswerRepository.save(answer);

        boolean lastQuestion = userAnswerRepository.countByAttempt_Id(attemptId) >= questions.size();
        return answerGrader.toResult(graded, lastQuestion);
    }

    /** Finishes the attempt, scores it and unlocks the next lesson of the subject. */
    @Transactional
    public AttemptResultDto complete(CurrentUser user, Long attemptId) {
        UserAttempt attempt = ownedAttempt(user, attemptId);
        if (attempt.getCompletedAt() != null) {
            throw new ConflictException(ErrorCode.ATTEMPT_ALREADY_COMPLETED,
                    "Attempt " + attemptId + " is already completed");
        }

        Lesson lesson = attempt.getLesson();
        List<Question> questions = questionsOf(lesson);
        List<UserAnswer> answers = userAnswerRepository.findByAttempt_Id(attemptId);
        if (answers.size() < questions.size()) {
            throw new ConflictException(ErrorCode.ATTEMPT_INCOMPLETE,
                    "Attempt " + attemptId + " still has " + (questions.size() - answers.size())
                            + " unanswered questions");
        }

        LocalDateTime completedAt = LocalDateTime.now();
        attempt.setCompletedAt(completedAt);
        attemptRepository.save(attempt);

        int correctCount = (int) answers.stream().filter(answer -> Boolean.TRUE.equals(answer.getCorrect())).count();
        Subject subject = lesson.getSubject();
        List<Lesson> ordered = lessonRepository.findBySubject_IdOrderByOrderAsc(subject.getId());
        Lesson unlocked = progressService.unlockNext(attempt.getUser(), subject, ordered, lesson);

        return new AttemptResultDto(
                attempt.getId(),
                lesson.getId(),
                correctCount,
                questions.size(),
                accuracyPercent(correctCount, questions.size()),
                completedAt,
                unlocked == null ? null : unlocked.getId());
    }

    static int accuracyPercent(long correct, long total) {
        return total == 0 ? 0 : Math.round(correct * 100f / total);
    }

    /** Attempts of other students are reported as missing rather than as forbidden. */
    private UserAttempt ownedAttempt(CurrentUser user, Long attemptId) {
        UserAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> NotFoundException.of("Attempt", attemptId));
        if (!attempt.getUser().getId().equals(user.id())) {
            throw NotFoundException.of("Attempt", attemptId);
        }
        return attempt;
    }

    private UserAttempt open(User student, Lesson lesson) {
        UserAttempt attempt = new UserAttempt();
        attempt.setUser(student);
        attempt.setLesson(lesson);
        attempt.setStartedAt(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    private List<Question> questionsOf(Lesson lesson) {
        return questionRepository.findByLesson_IdOrderByOrderAsc(lesson.getId());
    }

    private AttemptDto toDto(UserAttempt attempt, Lesson lesson) {
        List<Question> questions = questionsOf(lesson);
        Map<Integer, Question> byId = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));
        Map<Integer, UserAnswer> answers = userAnswerRepository.findByAttempt_Id(attempt.getId()).stream()
                .collect(Collectors.toMap(answer -> answer.getQuestion().getId(), Function.identity(),
                        (first, second) -> first));

        LessonStatus status = attempt.getCompletedAt() != null ? LessonStatus.COMPLETED : LessonStatus.IN_PROGRESS;
        return new AttemptDto(
                attempt.getId(),
                contentMapper.toLesson(lesson, status, questions),
                attempt.getStartedAt(),
                attempt.getCompletedAt(),
                currentQuestionIndex(questions, answers),
                questions.stream()
                        .map(question -> answers.get(question.getId()))
                        .filter(java.util.Objects::nonNull)
                        .map(answer -> toAnswerDto(answer, byId.get(answer.getQuestion().getId())))
                        .toList());
    }

    /** First question still without an answer, or the question count once everything is answered. */
    private static int currentQuestionIndex(List<Question> questions, Map<Integer, UserAnswer> answers) {
        for (int index = 0; index < questions.size(); index++) {
            if (!answers.containsKey(questions.get(index).getId())) {
                return index;
            }
        }
        return questions.size();
    }

    private static AnswerDto toAnswerDto(UserAnswer answer, Question question) {
        boolean input = question.getType() == QuestionType.INPUT;
        return new AnswerDto(
                question.getId(),
                answer.getSelectedOptions().stream()
                        .map(AnswerOption::getId)
                        .sorted(Comparator.naturalOrder())
                        .toList(),
                answer.getAnswerText(),
                Boolean.TRUE.equals(answer.getCorrect()),
                input ? List.of() : AnswerGrader.correctOptionIds(question),
                input ? question.getCorrectAnswer() : null,
                question.getExplanation(),
                answer.getAnsweredAt());
    }
}
