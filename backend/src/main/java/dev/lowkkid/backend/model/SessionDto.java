package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * Result of opening the mini app. The session both measures time spent in the app and scopes
 * the shuffled practice deck: a new session reshuffles the questions.
 */
public record SessionDto(Long sessionId, LocalDateTime startedAt, ProfileDto profile) {
}
