package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Grants or extends access of a student to a subject, e.g. "russian paid until december".
 */
public record SubscriptionRequest(@NotNull LocalDateTime paidUntil) {
}
