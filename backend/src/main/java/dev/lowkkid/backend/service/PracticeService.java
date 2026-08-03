package dev.lowkkid.backend.service;

import dev.lowkkid.backend.model.PracticeAnswerResultDto;
import dev.lowkkid.backend.model.PracticeQuestionDto;
import dev.lowkkid.backend.model.StreakDto;
import dev.lowkkid.backend.model.SubmitAnswerRequest;
import dev.lowkkid.backend.security.CurrentUser;

/**
 * Endless feed of questions of one subject.
 *
 * <p>The deck is built once per app session out of the questions of the lessons already unlocked
 * for the student plus the practice only questions of the subject, then shuffled. The cursor
 * survives navigation to other tabs within the session, and the deck restarts from the top when
 * exhausted. A new session builds a new deck with a new order. Answers here are not stored and do
 * not show up in the statistics, they only move the streak.
 */
public interface PracticeService {

    /**
     * Question the student is currently on, without advancing the cursor.
     *
     * @throws dev.lowkkid.backend.exception.NotFoundException if the subject has no questions
     *                                                         available to this student
     */
    PracticeQuestionDto next(CurrentUser user, Integer subjectId);

    /** Checks the answer, moves the streak and advances the cursor to the next question. */
    PracticeAnswerResultDto answer(CurrentUser user, Integer subjectId, SubmitAnswerRequest request);

    StreakDto streak(CurrentUser user);
}
