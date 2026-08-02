package dev.lowkkid.backend.model;

import java.util.List;

/**
 * Verdict shown right after answering, together with the explanation of the question.
 *
 * @param correctOptionIds correct options, empty for INPUT questions
 * @param correctAnswer    expected text, {@code null} for option based questions
 */
public record AnswerResultDto(Integer questionId,
                              boolean correct,
                              List<Integer> correctOptionIds,
                              String correctAnswer,
                              String explanation,
                              boolean lastQuestion) {
}
