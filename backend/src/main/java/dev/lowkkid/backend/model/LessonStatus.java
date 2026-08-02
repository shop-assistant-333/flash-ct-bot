package dev.lowkkid.backend.model;

/**
 * Lock state of a lesson for a given student: lessons open one after another.
 */
public enum LessonStatus {
    /** Shown with a padlock, the previous lesson is not finished yet. */
    LOCKED,
    /** Open, not started. */
    AVAILABLE,
    /** Open, has an attempt with unanswered questions left. */
    IN_PROGRESS,
    /** Finished, opens in review mode. */
    COMPLETED
}
