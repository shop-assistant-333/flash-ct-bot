package dev.lowkkid.backend.model.admin;

public record AdminLessonItem(Integer id,
                              Integer subjectId,
                              String title,
                              String description,
                              Integer order,
                              int questionCount) {
}
