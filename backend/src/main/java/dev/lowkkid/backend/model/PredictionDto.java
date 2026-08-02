package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * AI estimate of the exam score, computed from the last month of homework results.
 *
 * @param score      estimated result, {@code null} while there is not enough data yet
 * @param comment    short explanation shown under the number
 * @param computedAt when the estimate was produced; responses may be served from cache
 */
public record PredictionDto(Integer subjectId,
                            Integer score,
                            String comment,
                            LocalDateTime computedAt) {
}
