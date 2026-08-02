package dev.lowkkid.backend.model;

import dev.lowkkid.backend.entity.UserRole;

import java.util.List;

/**
 * Content of the profile tab. The frontend also uses {@code role} to decide whether to render
 * the admin panel instead of the four student tabs.
 */
public record ProfileDto(Integer id,
                         String tgId,
                         String username,
                         String firstName,
                         String lastName,
                         UserRole role,
                         List<SubscriptionItem> subscriptions) {
}
