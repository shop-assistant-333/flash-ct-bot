package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.model.StreakDto;

/**
 * What the admin sees about how a student actually uses the app, next to their progress.
 *
 * <p>Counted over every subject at once: unlike the statistics tab, which a student opens for one
 * subject at a time, this is a single glance at the whole student. A teacher sees
 * {@code answered}/{@code correct}/{@code accuracyPercent} over their own subjects instead.
 *
 * <p>{@code timeSpentMinutes} and {@code streak} stay over the whole app even for a teacher:
 * sessions and the practice streak are not tied to a subject in the schema at all.
 *
 * @param answered          homework answers; practice is repeatable and stays out
 * @param timeSpentMinutes  total time in the app, summed over all sessions
 */
public record UserActivityItem(int answered,
                               int correct,
                               int accuracyPercent,
                               long timeSpentMinutes,
                               StreakDto streak) {
}
