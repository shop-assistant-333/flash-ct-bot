package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.Lesson;

import java.time.LocalDateTime;

/**
 * When a lesson opens for the students.
 *
 * <p>Homework follows the live lessons of the teacher rather than the pace of the student: the
 * admin writes down the moment every lesson opens, and every student of the subject gets it at
 * that same moment. There is no order to it, so several lessons can be open at once and a student
 * is free to pick any of them.
 *
 * <p>A lesson the admin has not scheduled yet stays closed. It is still listed with its title, as
 * every locked lesson is, so the students can see what is coming.
 */
public final class LessonAccess {

    private LessonAccess() {
    }

    public static boolean isOpen(Lesson lesson) {
        return lesson.getOpensAt() != null && !lesson.getOpensAt().isAfter(LocalDateTime.now());
    }
}
