package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.model.SubscriptionItem;

import java.util.List;

/**
 * Admin user card: contacts, paid subjects, progress and activity.
 */
public record AdminUserDto(Integer id,
                           String tgId,
                           String username,
                           String firstName,
                           String lastName,
                           UserRole role,
                           List<SubscriptionItem> subscriptions,
                           List<UserProgressItem> progress,
                           UserActivityItem activity) {
}
