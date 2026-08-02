package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.model.SubscriptionItem;

import java.util.List;

/**
 * Row of the admin user list.
 */
public record AdminUserItem(Integer id,
                            String tgId,
                            String username,
                            String firstName,
                            String lastName,
                            UserRole role,
                            List<SubscriptionItem> subscriptions) {
}
