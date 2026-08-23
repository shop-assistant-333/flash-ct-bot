package dev.lowkkid.backend.model.admin;

/**
 * A subject a teacher is allowed to edit.
 *
 * <p>Deliberately not {@link dev.lowkkid.backend.model.SubscriptionItem}: that one carries
 * {@code paidUntil} and {@code active}, which mean nothing for a teacher.
 */
public record TaughtSubjectItem(Integer subjectId, String subjectName) {
}
