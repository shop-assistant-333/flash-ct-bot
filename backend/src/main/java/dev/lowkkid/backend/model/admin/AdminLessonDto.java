package dev.lowkkid.backend.model.admin;

import java.util.List;

public record AdminLessonDto(Integer id,
                             Integer subjectId,
                             String title,
                             String description,
                             Integer order,
                             List<AdminQuestionDto> questions) {
}
