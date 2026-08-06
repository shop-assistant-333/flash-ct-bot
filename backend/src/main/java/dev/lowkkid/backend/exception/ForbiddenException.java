package dev.lowkkid.backend.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        this(ErrorCode.FORBIDDEN, message);
    }

    public ForbiddenException(String code, String message) {
        super(HttpStatus.FORBIDDEN, code, message);
    }

    public static ForbiddenException subscriptionExpired(Integer subjectId) {
        return new ForbiddenException(ErrorCode.SUBSCRIPTION_EXPIRED,
                "Subject " + subjectId + " is not paid for");
    }

    public static ForbiddenException lessonLocked(Integer lessonId) {
        return new ForbiddenException(ErrorCode.LESSON_LOCKED,
                "Lesson " + lessonId + " has not opened yet");
    }
}
