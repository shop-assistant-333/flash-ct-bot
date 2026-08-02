package dev.lowkkid.backend.model;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * One answer, both in a lesson attempt and in practice.
 *
 * <p>Exactly one payload field is used depending on the question type: {@code selectedOptionIds}
 * for SINGLE_ANSWER (one id) and MULTI_ANSWER, {@code answerText} for INPUT.
 * Text answers are compared case insensitively.
 */
public record SubmitAnswerRequest(@NotNull Integer questionId,
                                  List<Integer> selectedOptionIds,
                                  String answerText) {
}
