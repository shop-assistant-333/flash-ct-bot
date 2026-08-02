package dev.lowkkid.backend.model;

/**
 * Verdict of a practice answer. Practice never counts towards the statistics tab, it only moves
 * the streak.
 */
public record PracticeAnswerResultDto(AnswerResultDto result, StreakDto streak) {
}
