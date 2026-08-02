package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * Paid access of a student to one subject. Dates are filled in by the admin by hand.
 *
 * @param active {@code false} once {@code paidUntil} is in the past
 */
public record SubscriptionItem(Integer subjectId,
                               String subjectName,
                               LocalDateTime paidUntil,
                               boolean active) {
}
