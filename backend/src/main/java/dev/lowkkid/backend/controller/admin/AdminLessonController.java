package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.LessonRequest;
import dev.lowkkid.backend.model.admin.ReorderRequest;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.security.SubjectAccessGuard;
import dev.lowkkid.backend.service.admin.AdminLessonService;
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

import java.util.List;

/**
 * Lessons of a subject. A teacher has the same rights here as an admin, within their own subjects
 * — hence a {@link SubjectAccessGuard} call in front of every method.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/lessons")
public class AdminLessonController {

    private final AdminLessonService adminLessonService;
    private final AdminQuestionService adminQuestionService;
    private final SubjectAccessGuard accessGuard;

    @GetMapping("/{lessonId}")
    public ResponseEntity<AdminLessonDto> lesson(@AuthUser CurrentUser user,
                                                 @PathVariable Integer lessonId) {
        accessGuard.requireLesson(user, lessonId);
        return ResponseEntity.ok(adminLessonService.get(lessonId));
    }

    @PostMapping
    public ResponseEntity<AdminLessonDto> create(@AuthUser CurrentUser user,
                                                 @Valid @RequestBody LessonRequest request) {
        accessGuard.requireSubject(user, request.subjectId());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminLessonService.create(request));
    }

    /** The body carries a subject too, so a lesson cannot be moved into somebody else's. */
    @PutMapping("/{lessonId}")
    public ResponseEntity<AdminLessonDto> update(@AuthUser CurrentUser user,
                                                 @PathVariable Integer lessonId,
                                                 @Valid @RequestBody LessonRequest request) {
        accessGuard.requireLesson(user, lessonId);
        accessGuard.requireSubject(user, request.subjectId());
        return ResponseEntity.ok(adminLessonService.update(lessonId, request));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(@AuthUser CurrentUser user, @PathVariable Integer lessonId) {
        accessGuard.requireLesson(user, lessonId);
        adminLessonService.delete(lessonId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{lessonId}/questions")
    public ResponseEntity<List<AdminQuestionDto>> questions(@AuthUser CurrentUser user,
                                                            @PathVariable Integer lessonId) {
        accessGuard.requireLesson(user, lessonId);
        return ResponseEntity.ok(adminQuestionService.findByLesson(lessonId));
    }

    @PutMapping("/{lessonId}/questions/order")
    public ResponseEntity<List<AdminQuestionDto>> reorderQuestions(@AuthUser CurrentUser user,
                                                                   @PathVariable Integer lessonId,
                                                                   @Valid @RequestBody ReorderRequest request) {
        accessGuard.requireLesson(user, lessonId);
        return ResponseEntity.ok(adminQuestionService.reorder(lessonId, request.ids()));
    }
}
