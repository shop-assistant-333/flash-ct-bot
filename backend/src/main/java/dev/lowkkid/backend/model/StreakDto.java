package dev.lowkkid.backend.model;

/**
 * Practice streak: consecutive correct answers. Survives across sessions until a wrong answer.
 */
public record StreakDto(int current, int best) {
}
