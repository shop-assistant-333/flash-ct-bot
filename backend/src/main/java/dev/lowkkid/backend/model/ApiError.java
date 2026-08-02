package dev.lowkkid.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Body of every non 2xx response.
 *
 * @param code   stable identifier from {@link dev.lowkkid.backend.exception.ErrorCode}
 * @param fields per field messages, present only for validation failures
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String code, String message, LocalDateTime timestamp, Map<String, String> fields) {

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, LocalDateTime.now(), null);
    }

    public static ApiError of(String code, String message, Map<String, String> fields) {
        return new ApiError(code, message, LocalDateTime.now(), fields);
    }
}
