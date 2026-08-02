package dev.lowkkid.backend.model;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Explicit page envelope, so the wire format does not depend on Spring Data internals.
 */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
