package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** @param subjectId subject of the topic; a topic is never moved to another one */
public record SectionRequest(@NotNull Integer subjectId, @NotBlank String title) {
}
