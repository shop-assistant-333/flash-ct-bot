package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * Summary screen of a finished lesson.
 *
 * @param unlockedLessonId lesson opened by this completion, {@code null} if it was the last one
 */
public record AttemptResultDto(Long attemptId,
                               Integer lessonId,
                               int correctCount,
                               int totalCount,
                               int accuracyPercent,
                               LocalDateTime completedAt,
                               Integer unlockedLessonId) {
}
