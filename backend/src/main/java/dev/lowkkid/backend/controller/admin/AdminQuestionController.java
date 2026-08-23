package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.QuestionRequest;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.security.SubjectAccessGuard;
import dev.lowkkid.backend.service.admin.AdminQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Questions with their answer key. Listing is done through the owning lesson or subject, see
 * {@link AdminLessonController} and {@link AdminSubjectController}.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/questions")
public class AdminQuestionController {

    private final AdminQuestionService adminQuestionService;
    private final SubjectAccessGuard accessGuard;

    @GetMapping("/{questionId}")
    public ResponseEntity<AdminQuestionDto> question(@AuthUser CurrentUser user,
                                                     @PathVariable Integer questionId) {
        accessGuard.requireQuestion(user, questionId);
        return ResponseEntity.ok(adminQuestionService.get(questionId));
    }

    @PostMapping
    public ResponseEntity<AdminQuestionDto> create(@AuthUser CurrentUser user,
                                                   @Valid @RequestBody QuestionRequest request) {
        requireOwner(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminQuestionService.create(request));
    }

    /** Replaces the question together with its whole set of options. */
    @PutMapping("/{questionId}")
    public ResponseEntity<AdminQuestionDto> update(@AuthUser CurrentUser user,
                                                   @PathVariable Integer questionId,
                                                   @Valid @RequestBody QuestionRequest request) {
        accessGuard.requireQuestion(user, questionId);
        // The body may move the question to another lesson or subject; that target is checked too.
        requireOwner(user, request);
        return ResponseEntity.ok(adminQuestionService.update(questionId, request));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(@AuthUser CurrentUser user,
                                       @PathVariable Integer questionId) {
        accessGuard.requireQuestion(user, questionId);
        adminQuestionService.delete(questionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * A question hangs off a lesson or off a subject; a body that sets both or neither is rejected
     * by the service with a readable message, so nothing is checked here.
     */
    private void requireOwner(CurrentUser user, QuestionRequest request) {
        if (request.lessonId() != null) {
            accessGuard.requireLesson(user, request.lessonId());
        } else if (request.subjectId() != null) {
            accessGuard.requireSubject(user, request.subjectId());
        }
    }
}
