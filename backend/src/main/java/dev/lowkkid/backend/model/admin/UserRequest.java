package dev.lowkkid.backend.model.admin;

import dev.lowkkid.backend.entity.UserRole;
import jakarta.validation.constraints.NotBlank;

/**
 * Create or update a student by hand, before their first launch of the mini app.
 *
 * <p>{@code tgId} is unknown until the student opens the app, so a record created here is matched
 * by {@code username} on first launch and gets its telegram id filled in then.
 */
public record UserRequest(@NotBlank String username,
                          String tgId,
                          String firstName,
                          String lastName,
                          UserRole role) {
}
