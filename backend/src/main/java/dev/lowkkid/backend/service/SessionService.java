package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserSession;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.SessionDto;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.repository.UserSessionRepository;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Tracks time spent in the app and marks the boundary at which the practice deck is reshuffled.
 *
 * <p>{@code ended_at} doubles as the moment the user was last seen: every heartbeat pushes it
 * forward, so the length of a visit is simply {@code ended_at - started_at}. A session with no
 * heartbeat for longer than {@code app.session.idle-timeout} counts as closed, and the next call
 * opens a new one.
 */
@Service
@RequiredArgsConstructor
public class SessionService {

    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ProfileService profileService;

    @Value("${app.session.idle-timeout}")
    private Duration idleTimeout;

    /** Opens a session, or returns the one still alive for this user. */
    @Transactional
    public SessionDto start(CurrentUser user) {
        UserSession session = liveSession(user.id()).orElseGet(() -> open(user.id()));
        return new SessionDto(session.getId(), session.getStartedAt(), profileService.profileOf(user));
    }

    /**
     * Pushes the end of the open session forward; called by the frontend on a timer. A heartbeat
     * that arrives after the idle timeout opens a new session instead, since the previous visit is
     * already over.
     */
    @Transactional
    public void heartbeat(CurrentUser user) {
        liveSession(user.id()).ifPresentOrElse(this::touch, () -> open(user.id()));
    }

    /** Closes the open session explicitly, when telegram reports the app is being closed. */
    @Transactional
    public void end(CurrentUser user) {
        liveSession(user.id()).ifPresent(this::touch);
    }

    /**
     * Session the practice deck of this user is currently scoped to; empty when the last visit has
     * already gone stale.
     */
    @Transactional(readOnly = true)
    public Optional<Long> currentSessionId(Integer userId) {
        return liveSession(userId).map(UserSession::getId);
    }

    private Optional<UserSession> liveSession(Integer userId) {
        return sessionRepository.findFirstByUser_IdOrderByStartedAtDesc(userId)
                .filter(session -> lastSeen(session).plus(idleTimeout).isAfter(LocalDateTime.now()));
    }

    private static LocalDateTime lastSeen(UserSession session) {
        return session.getEndedAt() != null ? session.getEndedAt() : session.getStartedAt();
    }

    private UserSession open(Integer userId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> NotFoundException.of("User", userId));
        LocalDateTime now = LocalDateTime.now();
        UserSession session = new UserSession();
        session.setUser(student);
        session.setStartedAt(now);
        session.setEndedAt(now);
        return sessionRepository.save(session);
    }

    private void touch(UserSession session) {
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}
