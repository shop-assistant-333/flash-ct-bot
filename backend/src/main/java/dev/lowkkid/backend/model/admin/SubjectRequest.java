package dev.lowkkid.backend.model.admin;

import jakarta.validation.constraints.NotBlank;

public record SubjectRequest(@NotBlank String name) {
}
