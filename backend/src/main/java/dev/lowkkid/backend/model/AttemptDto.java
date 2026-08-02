package dev.lowkkid.backend.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Full state of a homework run. Everything needed to restore the screen after the student closed
 * telegram mid lesson: the questions, the answers already given and where to continue.
 *
 * @param currentQuestionIndex index into {@code lesson.questions()} to resume at; equals the
 *                             question count when every question is answered
 * @param completedAt          non null once the attempt is finished, the screen is then read only
 */
public record AttemptDto(Long id,
                         LessonDto lesson,
                         LocalDateTime startedAt,
                         LocalDateTime completedAt,
                         int currentQuestionIndex,
                         List<AnswerDto> answers) {
}
