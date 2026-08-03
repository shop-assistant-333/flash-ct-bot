package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.AnswerOption;
import dev.lowkkid.backend.entity.Question;
import dev.lowkkid.backend.entity.QuestionType;
import dev.lowkkid.backend.exception.BadRequestException;
import dev.lowkkid.backend.model.AnswerResultDto;
import dev.lowkkid.backend.model.SubmitAnswerRequest;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Marks one answer, in homework and in practice alike.
 *
 * <p>Exactly one payload field of the request is used, depending on the type of the question:
 * the picked options for SINGLE_ANSWER and MULTI_ANSWER, the typed text for INPUT. Text is
 * compared case insensitively and with the surrounding spaces removed.
 */
@Component
public class AnswerGrader {

    public Graded grade(Question question, SubmitAnswerRequest request) {
        return switch (question.getType()) {
            case SINGLE_ANSWER -> gradeOptions(question, request, 1);
            case MULTI_ANSWER -> gradeOptions(question, request, Integer.MAX_VALUE);
            case INPUT -> gradeInput(question, request);
        };
    }

    public AnswerResultDto toResult(Graded graded, boolean lastQuestion) {
        Question question = graded.question();
        boolean input = question.getType() == QuestionType.INPUT;
        return new AnswerResultDto(
                question.getId(),
                graded.correct(),
                input ? List.of() : correctOptionIds(question),
                input ? question.getCorrectAnswer() : null,
                question.getExplanation(),
                lastQuestion);
    }

    public static List<Integer> correctOptionIds(Question question) {
        return question.getAnswerOptions().stream()
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .map(AnswerOption::getId)
                .sorted()
                .toList();
    }

    private Graded gradeOptions(Question question, SubmitAnswerRequest request, int maxPicks) {
        List<Integer> picked = request.selectedOptionIds() == null ? List.of() : request.selectedOptionIds();
        if (picked.isEmpty()) {
            throw new BadRequestException("Question " + question.getId() + " expects selectedOptionIds");
        }
        if (picked.size() > maxPicks) {
            throw new BadRequestException("Question " + question.getId() + " expects a single option");
        }
        if (request.answerText() != null && !request.answerText().isBlank()) {
            throw new BadRequestException("Question " + question.getId() + " does not expect answerText");
        }

        Map<Integer, AnswerOption> known = question.getAnswerOptions().stream()
                .collect(Collectors.toMap(AnswerOption::getId, Function.identity()));
        Set<AnswerOption> selected = new LinkedHashSet<>();
        for (Integer optionId : picked) {
            AnswerOption option = known.get(optionId);
            if (option == null) {
                throw new BadRequestException(
                        "Option " + optionId + " does not belong to question " + question.getId());
            }
            selected.add(option);
        }

        Set<Integer> expected = Set.copyOf(correctOptionIds(question));
        boolean correct = expected.equals(selected.stream().map(AnswerOption::getId).collect(Collectors.toSet()));
        return new Graded(question, correct, List.copyOf(selected), null);
    }

    private Graded gradeInput(Question question, SubmitAnswerRequest request) {
        if (request.selectedOptionIds() != null && !request.selectedOptionIds().isEmpty()) {
            throw new BadRequestException("Question " + question.getId() + " does not expect selectedOptionIds");
        }
        String answered = request.answerText();
        if (answered == null || answered.isBlank()) {
            throw new BadRequestException("Question " + question.getId() + " expects answerText");
        }
        boolean correct = question.getCorrectAnswer() != null
                && normalize(question.getCorrectAnswer()).equals(normalize(answered));
        return new Graded(question, correct, List.of(), answered.trim());
    }

    private static String normalize(String text) {
        return text.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    /**
     * Verdict plus what the student actually picked, ready to be stored as a {@code user_answers}
     * row.
     *
     * @param answerText typed text, {@code null} for option based questions
     */
    public record Graded(Question question, boolean correct, List<AnswerOption> selectedOptions, String answerText) {

        public List<Integer> selectedOptionIds() {
            return selectedOptions.stream().map(AnswerOption::getId).sorted(Comparator.naturalOrder()).toList();
        }
    }
}
