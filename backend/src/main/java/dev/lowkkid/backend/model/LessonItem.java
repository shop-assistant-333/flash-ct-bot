package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * Row of the homework list.
 *
 * @param opensAt       moment the lesson opens, {@code null} while it has no date yet
 * @param correctAnswers number of correct answers, {@code null} until the lesson is started
 */
public record LessonItem(Integer id,
                         String title,
                         String description,
                         Integer order,
                         LocalDateTime opensAt,
                         LessonStatus status,
                         int questionCount,
                         Integer correctAnswers) {
}
