package dev.lowkkid.backend.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        this(ErrorCode.NOT_FOUND, message);
    }

    public NotFoundException(String code, String message) {
        super(HttpStatus.NOT_FOUND, code, message);
    }

    public static NotFoundException of(String entity, Object id) {
        return new NotFoundException(entity + " " + id + " not found");
    }

    public static NotFoundException practiceDeckEmpty(Integer subjectId) {
        return new NotFoundException(ErrorCode.PRACTICE_DECK_EMPTY,
                "No practice questions available for subject " + subjectId);
    }
}
