package dev.lowkkid.backend.model.admin;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @param opensAt moment the lesson opens for the students, {@code null} while it is not scheduled
 */
public record AdminLessonDto(Integer id,
                             Integer subjectId,
                             String title,
                             String description,
                             Integer order,
                             LocalDateTime opensAt,
                             List<AdminQuestionDto> questions) {
}
