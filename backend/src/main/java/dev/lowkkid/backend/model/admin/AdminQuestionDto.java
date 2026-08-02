package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.QuestionType;

import java.util.List;

/**
 * Question with the answer key. Exactly one of {@code lessonId} / {@code subjectId} is set:
 * a question either belongs to a lesson, or exists only in the practice pool of a subject.
 */
public record AdminQuestionDto(Integer id,
                               Integer lessonId,
                               Integer subjectId,
                               String title,
                               QuestionType type,
                               Integer order,
                               String correctAnswer,
                               String explanation,
                               List<AdminAnswerOptionDto> options) {
}
