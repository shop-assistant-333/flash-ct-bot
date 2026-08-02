package dev.lowkkid.backend.model;

import dev.lowkkid.backend.entity.QuestionType;

import java.util.List;

/**
 * Question as the student sees it. {@code options} is empty for {@link QuestionType#INPUT}.
 */
public record QuestionDto(Integer id,
                          String title,
                          QuestionType type,
                          Integer order,
                          List<AnswerOptionDto> options) {
}
