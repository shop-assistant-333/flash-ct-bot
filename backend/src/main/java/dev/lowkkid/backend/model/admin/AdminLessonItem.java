package dev.lowkkid.backend.model.admin;

import java.time.LocalDateTime;

/**
 * @param opensAt moment the lesson opens for the students, {@code null} while it is not scheduled
 */
public record AdminLessonItem(Integer id,
                              Integer subjectId,
                              String title,
                              String description,
                              Integer order,
                              LocalDateTime opensAt,
                              int questionCount) {
}
