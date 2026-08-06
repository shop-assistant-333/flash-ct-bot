package dev.lowkkid.backend.model;

/**
 * Lock state of a lesson for a given student: lessons open on the date the admin scheduled them
 * for, all at once for everybody who paid for the subject.
 */
public enum LessonStatus {
    /** Shown with a padlock: the date has not arrived yet, or was never set. */
    LOCKED,
    /** Open, not started. */
    AVAILABLE,
    /** Open, has an attempt with unanswered questions left. */
    IN_PROGRESS,
    /** Finished, opens in review mode. */
    COMPLETED
}
