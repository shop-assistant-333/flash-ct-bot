package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.model.SubscriptionItem;

import java.util.List;

/**
 * Row of the admin user list.
 *
 * @param taughtSubjects filled for a TEACHER only, empty for everybody else
 */
public record AdminUserItem(Integer id,
                            String tgId,
                            String username,
                            String firstName,
                            String lastName,
                            UserRole role,
                            List<SubscriptionItem> subscriptions,
                            List<TaughtSubjectItem> taughtSubjects) {
}
