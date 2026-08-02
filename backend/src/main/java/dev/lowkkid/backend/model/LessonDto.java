package dev.lowkkid.backend.model;

import java.util.List;

/**
 * Lesson with its questions, in the order configured by the admin.
 */
public record LessonDto(Integer id,
                        Integer subjectId,
                        String title,
                        String description,
                        Integer order,
                        LessonStatus status,
                        List<QuestionDto> questions) {
}
