package dev.lowkkid.backend.model;

/**
 * Row of the homework list.
 *
 * @param correctAnswers number of correct answers, {@code null} until the lesson is started
 */
public record LessonItem(Integer id,
                         String title,
                         String description,
                         Integer order,
                         LessonStatus status,
                         int questionCount,
                         Integer correctAnswers) {
}
