package dev.lowkkid.backend.model;

/**
 * Per lesson breakdown of the statistics tab; also the input the AI prediction reasons over.
 */
public record LessonStatsItem(Integer lessonId,
                              String title,
                              int correct,
                              int total,
                              int accuracyPercent) {
}
