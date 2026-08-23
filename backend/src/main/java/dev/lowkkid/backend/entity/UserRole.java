package dev.lowkkid.backend.entity;

public enum UserRole {
    USER,
    ADMIN,
    /** Edits the content of the subjects assigned to them, and watches their students. */
    TEACHER
}
