package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.AnswerOption;
import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.AnswerOptionRequest;
import dev.lowkkid.backend.model.admin.QuestionRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Questions and their answer key.
 *
 * <p>A question belongs either to a lesson or straight to a subject; the second kind is the extra
 * material that shows up in practice only and never in the programme of lessons. The database
 * enforces that it is one or the other, and so does this service, with a readable message.
 *
 * <p>Editing is allowed after students have answered — a typo has to be fixable — but anything
 * that would rewrite what a student already did is refused instead: deleting an answered question,
 * or dropping an option somebody picked.
 */
@Service
@RequiredArgsConstructor
public class AdminQuestionServiceImpl implements AdminQuestionService {

    private final QuestionRepository questionRepository;
    private final LessonRepository lessonRepository;
    private final SubjectRepository subjectRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final AdminContentMapper contentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuestionDto> findByLesson(Integer lessonId) {
        return contentMapper.toQuestions(questionRepository.findByLesson_IdOrderByOrderAsc(lessonId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuestionDto> findPracticeOnly(Integer subjectId) {
        return contentMapper.toQuestions(questionRepository.findBySubject_IdOrderByIdAsc(subjectId));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminQuestionDto get(Integer questionId) {
        return contentMapper.toQuestion(question(questionId));
    }

    @Override
    @Transactional
    public AdminQuestionDto create(QuestionRequest request) {
        validate(request);

        Question question = new Question();
        applyOwner(question, request);
        applyContent(question, request);
        replaceOptions(question, request);
        questionRepository.save(question);

        placeAt(question, request.order());
        return contentMapper.toQuestion(question);
    }

    /** Replaces the question together with its whole set of options, as the contract promises. */
    @Override
    @Transactional
    public AdminQuestionDto update(Integer questionId, QuestionRequest request) {
        validate(request);

        Question question = question(questionId);
        Lesson previousLesson = question.getLesson();

        applyOwner(question, request);
        applyContent(question, request);
        replaceOptions(question, request);
        questionRepository.save(question);

        boolean moved = previousLesson != null
                && (question.getLesson() == null || !previousLesson.getId().equals(question.getLesson().getId()));
        if (moved) {
            questionRepository.flush();
            resequence(questionRepository.findByLesson_IdOrderByOrderAsc(previousLesson.getId()));
        }
        // An omitted order means "leave it where it is", unlike on create where it means "append".
        Integer wantedOrder = request.order() == null && !moved ? question.getOrder() : request.order();
        placeAt(question, wantedOrder);

        return contentMapper.toQuestion(question);
    }

    /**
     * @throws ConflictException if a student has already answered it; the answer would lose the
     *                           question it belongs to
     */
    @Override
    @Transactional
    public void delete(Integer questionId) {
        Question question = question(questionId);
        if (userAnswerRepository.existsByQuestion_Id(questionId)) {
            throw new ConflictException("Question " + questionId + " has already been answered by students");
        }

        Lesson lesson = question.getLesson();
        questionRepository.delete(question);
        questionRepository.flush();
        if (lesson != null) {
            resequence(questionRepository.findByLesson_IdOrderByOrderAsc(lesson.getId()));
        }
    }

    @Override
    @Transactional
    public List<AdminQuestionDto> reorder(Integer lessonId, List<Integer> questionIds) {
        List<Question> questions = questionRepository.findByLesson_IdOrderByOrderAsc(lessonId);
        Map<Integer, Question> byId = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        if (questionIds.size() != questions.size() || !byId.keySet().containsAll(questionIds)) {
            throw new BadRequestException(
                    "Reorder must list every question of lesson " + lessonId + " exactly once");
        }
        List<Question> reordered = questionIds.stream().distinct().map(byId::get).toList();
        if (reordered.size() != questions.size()) {
            throw new BadRequestException("Reorder lists a question of lesson " + lessonId + " twice");
        }

        resequence(reordered);
        return contentMapper.toQuestions(reordered);
    }

    /**
     * The database already refuses a question that belongs to both a lesson and a subject or to
     * neither; this repeats the rule early so the admin gets a sentence instead of a constraint
     * violation, and adds the checks the answer key needs to be usable.
     */
    private void validate(QuestionRequest request) {
        boolean hasLesson = request.lessonId() != null;
        boolean hasSubject = request.subjectId() != null;
        if (hasLesson == hasSubject) {
            throw new BadRequestException(
                    "A question belongs either to a lesson or to a subject, set exactly one of them");
        }

        List<AnswerOptionRequest> options = request.options() == null ? List.of() : request.options();
        if (request.type() == QuestionType.INPUT) {
            if (request.correctAnswer() == null || request.correctAnswer().isBlank()) {
                throw new BadRequestException("An INPUT question needs a correctAnswer");
            }
            if (!options.isEmpty()) {
                throw new BadRequestException("An INPUT question takes no options");
            }
            return;
        }

        if (options.size() < 2) {
            throw new BadRequestException("A " + request.type() + " question needs at least two options");
        }
        long correct = options.stream().filter(AnswerOptionRequest::correct).count();
        if (correct == 0) {
            throw new BadRequestException("A " + request.type() + " question needs a correct option");
        }
        if (request.type() == QuestionType.SINGLE_ANSWER && correct > 1) {
            throw new BadRequestException("A SINGLE_ANSWER question needs exactly one correct option");
        }
    }

    private void applyOwner(Question question, QuestionRequest request) {
        if (request.lessonId() != null) {
            question.setLesson(lessonRepository.findById(request.lessonId())
                    .orElseThrow(() -> NotFoundException.of("Lesson", request.lessonId())));
            question.setSubject(null);
        } else {
            question.setSubject(subjectRepository.findById(request.subjectId())
                    .orElseThrow(() -> NotFoundException.of("Subject", request.subjectId())));
            question.setLesson(null);
        }
    }

    private void applyContent(Question question, QuestionRequest request) {
        question.setTitle(request.title().trim());
        question.setType(request.type());
        question.setExplanation(request.explanation());
        question.setCorrectAnswer(request.type() == QuestionType.INPUT ? request.correctAnswer().trim() : null);
    }

    /**
     * Options carrying an id are kept and edited, the rest are new, and whatever is missing from
     * the list goes away — unless a student already picked it.
     */
    private void replaceOptions(Question question, QuestionRequest request) {
        List<AnswerOptionRequest> wanted = request.options() == null ? List.of() : request.options();
        Map<Integer, AnswerOption> existing = question.getAnswerOptions().stream()
                .collect(Collectors.toMap(AnswerOption::getId, Function.identity()));

        Set<Integer> kept = new LinkedHashSet<>();
        List<AnswerOption> options = new ArrayList<>(wanted.size());
        for (AnswerOptionRequest optionRequest : wanted) {
            AnswerOption option = optionRequest.id() == null ? null : existing.get(optionRequest.id());
            if (optionRequest.id() != null && option == null) {
                throw new BadRequestException("Option " + optionRequest.id()
                        + " does not belong to question " + question.getId());
            }
            if (option == null) {
                option = new AnswerOption();
                option.setQuestion(question);
            } else {
                kept.add(option.getId());
            }
            option.setText(optionRequest.text().trim());
            option.setCorrect(optionRequest.correct());
            options.add(option);
        }

        Set<Integer> dropped = existing.keySet().stream()
                .filter(id -> !kept.contains(id))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (!dropped.isEmpty() && userAnswerRepository.countAnswersUsingOptions(dropped) > 0) {
            throw new ConflictException("Options " + dropped + " were already picked by students "
                    + "and cannot be removed from question " + question.getId());
        }

        // Mutated in place rather than cleared and refilled: orphan removal would otherwise try to
        // delete the very rows that are being kept.
        question.getAnswerOptions().removeIf(option -> !kept.contains(option.getId()));
        for (AnswerOption option : options) {
            if (!question.getAnswerOptions().contains(option)) {
                question.getAnswerOptions().add(option);
            }
        }
    }

    /**
     * Practice only questions have no position to speak of, they are shuffled anyway; questions of
     * a lesson are placed where the admin asked, or appended.
     */
    private void placeAt(Question question, Integer wantedOrder) {
        if (question.getLesson() == null) {
            question.setOrder(null);
            questionRepository.save(question);
            return;
        }

        List<Question> siblings = questionRepository
                .findByLesson_IdOrderByOrderAsc(question.getLesson().getId()).stream()
                .filter(sibling -> !sibling.getId().equals(question.getId()))
                .toList();
        int index = wantedOrder == null
                ? siblings.size()
                : Math.clamp(wantedOrder - 1L, 0, siblings.size());

        List<Question> sequence = new ArrayList<>(siblings);
        sequence.add(index, question);
        resequence(sequence);
    }

    /**
     * Rewrites the positions to {@code 1..n}. Like the lessons, the position is unique per lesson
     * in the database, so the rows are parked on negative numbers first and only then given their
     * final ones.
     */
    private void resequence(List<Question> inWantedOrder) {
        for (int index = 0; index < inWantedOrder.size(); index++) {
            inWantedOrder.get(index).setOrder(-(index + 1));
        }
        questionRepository.saveAll(inWantedOrder);
        questionRepository.flush();

        for (int index = 0; index < inWantedOrder.size(); index++) {
            inWantedOrder.get(index).setOrder(index + 1);
        }
        questionRepository.saveAll(inWantedOrder);
        questionRepository.flush();
    }

    private Question question(Integer questionId) {
        return questionRepository.findWithOptionsById(questionId)
                .orElseThrow(() -> NotFoundException.of("Question", questionId));
    }
}
