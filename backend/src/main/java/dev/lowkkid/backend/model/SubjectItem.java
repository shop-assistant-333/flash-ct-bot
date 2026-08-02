package dev.lowkkid.backend.model;

import java.time.LocalDateTime;

/**
 * Subject the student has access to; drives the subject switch on the homework and practice tabs.
 */
public record SubjectItem(Integer id,
                          String name,
                          LocalDateTime paidUntil,
                          boolean active,
                          int lessonsTotal,
                          int lessonsCompleted) {
}
