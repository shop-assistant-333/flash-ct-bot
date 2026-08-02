package dev.lowkkid.backend.model;

/**
 * Answer option as the student sees it: correctness is never exposed before answering.
 */
public record AnswerOptionDto(Integer id, String text) {
}
