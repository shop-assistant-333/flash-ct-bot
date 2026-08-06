package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * @param order   position within the subject; appended to the end when omitted
 * @param opensAt moment the lesson opens for the students; always written as given, so an omitted
 *                one takes the date away and locks the lesson again
 */
public record LessonRequest(@NotNull Integer subjectId,
                            @NotBlank String title,
                            String description,
                            Integer order,
                            LocalDateTime opensAt) {
}
