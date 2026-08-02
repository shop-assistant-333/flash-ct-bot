package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotBlank;

/**
 * @param id kept when editing an existing option, {@code null} for a new one
 */
public record AnswerOptionRequest(Integer id, @NotBlank String text, boolean correct) {
}
