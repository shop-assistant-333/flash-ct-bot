package dev.lowkkid.backend.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Lesson with its questions, in the order configured by the admin.
 *
 * @param opensAt moment the lesson opens, {@code null} while it has no date yet
 */
public record LessonDto(Integer id,
                        Integer subjectId,
                        String title,
                        String description,
                        Integer order,
                        LocalDateTime opensAt,
                        LessonStatus status,
                        List<QuestionDto> questions) {
}
