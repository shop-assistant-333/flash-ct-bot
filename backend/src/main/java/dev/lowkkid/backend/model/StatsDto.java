package dev.lowkkid.backend.model;

import java.util.List;

/**
 * Statistics tab for one subject. Homework answers only: practice contributes the streak and
 * nothing else.
 *
 * @param lastMonth      window the AI prediction is based on, so recent progress is what counts
 * @param timeSpentMinutes total time in the app, summed over all sessions of the user
 */
public record StatsDto(Integer subjectId,
                       PeriodStatsDto total,
                       PeriodStatsDto lastMonth,
                       int lessonsCompleted,
                       int lessonsTotal,
                       long timeSpentMinutes,
                       StreakDto streak,
                       List<LessonStatsItem> byLesson) {
}
