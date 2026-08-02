package dev.lowkkid.backend.model;

/**
 * Answer counters over a time window.
 */
public record PeriodStatsDto(int answered, int correct, int accuracyPercent) {
}
