package dev.lowkkid.backend.model;

/**
 * Next card of the endless practice feed.
 *
 * @param position 1 based position in the current shuffled deck, for a progress hint
 * @param deckSize size of the deck; when {@code position} passes it the deck restarts from the top
 */
public record PracticeQuestionDto(Integer subjectId,
                                  QuestionDto question,
                                  StreakDto streak,
                                  int position,
                                  int deckSize) {
}
