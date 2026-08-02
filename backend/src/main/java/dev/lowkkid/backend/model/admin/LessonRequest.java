package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * @param order position within the subject; appended to the end when omitted
 */
public record LessonRequest(@NotNull Integer subjectId,
                            @NotBlank String title,
                            String description,
                            Integer order) {
}
