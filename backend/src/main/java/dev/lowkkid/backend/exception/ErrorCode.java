package dev.lowkkid.backend.exception;

/**
 * Machine readable {@code code} values returned in {@link dev.lowkkid.backend.model.ApiError}.
 * The frontend branches on these, never on the human readable message.
 */
public final class ErrorCode {

    /** initData header missing, malformed or with an invalid signature. */
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    /** Authenticated, but the role is not allowed to touch this resource. */
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String CONFLICT = "CONFLICT";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";

    /** The subject is not paid for, or the paid period has ended. */
    public static final String SUBSCRIPTION_EXPIRED = "SUBSCRIPTION_EXPIRED";
    /** The lesson has not opened yet, or has no opening date at all. */
    public static final String LESSON_LOCKED = "LESSON_LOCKED";
    /** The lesson has already been finished; homework is solved once. */
    public static final String ATTEMPT_ALREADY_COMPLETED = "ATTEMPT_ALREADY_COMPLETED";
    /** The question has already been answered within this attempt. */
    public static final String QUESTION_ALREADY_ANSWERED = "QUESTION_ALREADY_ANSWERED";
    /** Completion requested while some questions are still unanswered. */
    public static final String ATTEMPT_INCOMPLETE = "ATTEMPT_INCOMPLETE";
    /** The subject still holds lessons; they are deleted first, one by one. */
    public static final String SUBJECT_HAS_LESSONS = "SUBJECT_HAS_LESSONS";
    /** The subject still holds practice questions of its own. */
    public static final String SUBJECT_HAS_PRACTICE_QUESTIONS = "SUBJECT_HAS_PRACTICE_QUESTIONS";
    /** The subject is still paid for by students. */
    public static final String SUBJECT_HAS_SUBSCRIPTIONS = "SUBJECT_HAS_SUBSCRIPTIONS";
    /** The subject is still assigned to teachers. */
    public static final String SUBJECT_HAS_TEACHERS = "SUBJECT_HAS_TEACHERS";
    /** The topic already has its test; a topic holds one at most. */
    public static final String SECTION_HAS_TEST = "SECTION_HAS_TEST";

    /** No questions available for the requested practice subject. */
    public static final String PRACTICE_DECK_EMPTY = "PRACTICE_DECK_EMPTY";
    /** The AI score prediction could not be produced right now. */
    public static final String PREDICTION_UNAVAILABLE = "PREDICTION_UNAVAILABLE";

    private ErrorCode() {
    }
}
