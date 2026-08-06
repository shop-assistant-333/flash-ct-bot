package dev.lowkkid.backend.model.admin;

/**
 * How far a student got in one subject, shown on the admin user card.
 *
 * <p>Lessons open on a schedule rather than one after another, so a student has no single current
 * position: what is shown instead is the homework they handed in last.
 *
 * @param lastCompletedLessonId the most recently finished lesson, {@code null} if there is none
 */
public record UserProgressItem(Integer subjectId,
                               String subjectName,
                               Integer lastCompletedLessonId,
                               String lastCompletedLessonTitle,
                               int lessonsCompleted,
                               int lessonsTotal) {
}
