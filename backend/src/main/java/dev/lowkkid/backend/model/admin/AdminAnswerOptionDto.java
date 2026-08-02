package dev.lowkkid.backend.model.admin;

/**
 * Answer option with its correctness flag; admin side only.
 */
public record AdminAnswerOptionDto(Integer id, String text, boolean correct) {
}
