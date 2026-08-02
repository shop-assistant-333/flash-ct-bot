package dev.lowkkid.backend.security;

/**
 * Turns the raw telegram {@code initData} query string into an application user.
 */
public interface AuthService {

    /**
     * Validates the signature of {@code initData} against the bot token and returns the user it
     * belongs to, registering a new one on first launch.
     *
     * @throws dev.lowkkid.backend.exception.UnauthorizedException if the payload is missing,
     *                                                             malformed, expired or forged
     */
    CurrentUser authenticate(String initData);
}
