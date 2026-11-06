package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.LessonKind;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * @param order     position within the subject; appended to the end of its topic when omitted
 * @param opensAt   moment the lesson opens for the students; always written as given, so an omitted
 *                  one takes the date away and locks the lesson again
 * @param kind      lesson or test; {@code LESSON} when omitted on create, left as is on update
 * @param sectionId topic the lesson goes under; always written as given, so an omitted one takes
 *                  the lesson out of its topic
 */
public record LessonRequest(@NotNull Integer subjectId,
                            @NotBlank String title,
                            String description,
                            Integer order,
                            LocalDateTime opensAt,
                            LessonKind kind,
                            Integer sectionId) {
}
