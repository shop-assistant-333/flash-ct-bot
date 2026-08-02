package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * New order of lessons within a subject, or of questions within a lesson: the full list of ids in
 * the wanted order.
 */
public record ReorderRequest(@NotEmpty List<Integer> ids) {
}
