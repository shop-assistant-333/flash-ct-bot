package dev.lowkkid.backend.model;

import dev.lowkkid.backend.entity.LessonKind;

import java.time.LocalDateTime;

/**
 * Row of the homework list.
 *
 * @param opensAt       moment the lesson opens, {@code null} while it has no date yet
 * @param correctAnswers number of correct answers, {@code null} until the lesson is started
 * @param sectionId      topic the row is listed under, {@code null} outside every topic
 */
public record LessonItem(Integer id,
                         String title,
                         String description,
                         Integer order,
                         LocalDateTime opensAt,
                         LessonStatus status,
                         int questionCount,
                         Integer correctAnswers,
                         LessonKind kind,
                         Integer sectionId) {
}
