package dev.lowkkid.backend.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Answer already given within an attempt. Replayed on resume so the student sees what was picked
 * and why it was right or wrong.
 */
public record AnswerDto(Integer questionId,
                        List<Integer> selectedOptionIds,
                        String answerText,
                        boolean correct,
                        List<Integer> correctOptionIds,
                        String correctAnswer,
                        String explanation,
                        LocalDateTime answeredAt) {
}
