package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.model.SubscriptionItem;

import java.util.List;

/**
 * Admin user card: contacts, paid subjects, progress and activity.
 *
 * <p>Seen by a teacher it is narrower: {@code subscriptions} comes back empty and {@code progress}
 * holds their own subjects only — see {@code backend/API.md}, "Пользователи и оплата".
 *
 * @param taughtSubjects filled for a TEACHER only, empty for everybody else
 */
public record AdminUserDto(Integer id,
                           String tgId,
                           String username,
                           String firstName,
                           String lastName,
                           UserRole role,
                           List<SubscriptionItem> subscriptions,
                           List<TaughtSubjectItem> taughtSubjects,
                           List<UserProgressItem> progress,
                           UserActivityItem activity) {
}
