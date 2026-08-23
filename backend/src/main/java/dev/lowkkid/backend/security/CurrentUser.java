package dev.lowkkid.backend.security;

import dev.lowkkid.backend.entity.UserRole;

import java.util.Set;

/**
 * Caller of the current request, resolved from the telegram {@code initData} payload.
 *
 * @param taughtSubjectIds subjects a TEACHER may edit; empty for every other role
 */
public record CurrentUser(Integer id, String tgId, String username, UserRole role,
                          Set<Integer> taughtSubjectIds) {

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public boolean isTeacher() {
        return role == UserRole.TEACHER;
    }

    /** Whether the caller is allowed to touch the content of this subject at all. */
    public boolean manages(Integer subjectId) {
        return isAdmin() || (subjectId != null && taughtSubjectIds.contains(subjectId));
    }
}
