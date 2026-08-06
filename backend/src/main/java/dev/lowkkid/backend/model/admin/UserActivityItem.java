package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.model.StreakDto;

/**
 * What the admin sees about how a student actually uses the app, next to their progress.
 *
 * <p>Counted over every subject at once: unlike the statistics tab, which a student opens for one
 * subject at a time, this is a single glance at the whole student.
 *
 * @param answered          homework answers over all subjects; practice is repeatable and stays out
 * @param timeSpentMinutes  total time in the app, summed over all sessions
 */
public record UserActivityItem(int answered,
                               int correct,
                               int accuracyPercent,
                               long timeSpentMinutes,
                               StreakDto streak) {
}
