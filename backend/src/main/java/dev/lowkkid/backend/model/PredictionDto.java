package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * AI estimate of the exam score, computed from the last month of homework results.
 *
 * @param score      estimated result, {@code null} while there is not enough data yet, or while
 *                    the very first estimate for this student/subject is still being computed
 * @param comment    short explanation shown under the number
 * @param computedAt when {@code score}/{@code comment} were produced; {@code null} if nothing has
 *                    been computed yet
 * @param pending    {@code true} while a fresh estimate is being computed in the background because
 *                    new answers came in since the last one. {@code score}/{@code comment}/
 *                    {@code computedAt} may still carry the previous, now-stale estimate while this
 *                    is {@code true} - show it, but the caller should poll again shortly for the
 *                    fresh value.
 */
public record PredictionDto(Integer subjectId,
                            Integer score,
                            String comment,
                            LocalDateTime computedAt,
                            boolean pending) {
}
