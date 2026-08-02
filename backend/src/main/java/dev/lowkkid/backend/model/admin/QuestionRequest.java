package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Creates or replaces a question together with its answer options.
 *
 * <p>Set {@code lessonId} for a homework question, or {@code subjectId} for a question that only
 * shows up in practice. Setting both, or neither, is rejected.
 * {@code correctAnswer} is required for INPUT questions, {@code options} for the other types.
 */
public record QuestionRequest(Integer lessonId,
                              Integer subjectId,
                              @NotBlank String title,
                              @NotNull QuestionType type,
                              Integer order,
                              String correctAnswer,
                              String explanation,
                              @Valid List<AnswerOptionRequest> options) {
}
