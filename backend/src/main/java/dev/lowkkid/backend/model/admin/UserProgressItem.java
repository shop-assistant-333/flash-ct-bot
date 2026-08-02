package dev.lowkkid.backend.model.admin;

/**
 * How far a student got in one subject, shown on the admin user card.
 */
public record UserProgressItem(Integer subjectId,
                               String subjectName,
                               Integer currentLessonId,
                               String currentLessonTitle,
                               int lessonsCompleted,
                               int lessonsTotal) {
}
