package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * Summary screen of a finished lesson.
 */
public record AttemptResultDto(Long attemptId,
                               Integer lessonId,
                               int correctCount,
                               int totalCount,
                               int accuracyPercent,
                               LocalDateTime completedAt) {
}
