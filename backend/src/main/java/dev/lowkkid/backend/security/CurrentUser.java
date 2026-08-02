package dev.lowkkid.backend.security;

import dev.lowkkid.backend.entity.UserRole;

/**
 * Caller of the current request, resolved from the telegram {@code initData} payload.
 */
public record CurrentUser(Integer id, String tgId, String username, UserRole role) {

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}
