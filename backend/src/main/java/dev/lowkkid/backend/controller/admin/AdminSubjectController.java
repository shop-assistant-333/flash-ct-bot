package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.AdminSectionItem;
import dev.lowkkid.backend.model.admin.ReorderRequest;
import dev.lowkkid.backend.model.admin.SubjectDto;
import dev.lowkkid.backend.model.admin.SubjectRequest;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.security.SubjectAccessGuard;
import dev.lowkkid.backend.service.admin.AdminLessonService;
import dev.lowkkid.backend.service.admin.AdminQuestionService;
import dev.lowkkid.backend.service.admin.AdminSectionService;
import dev.lowkkid.backend.service.admin.AdminSubjectService;
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
 * Subjects and the way into their content. The set of subjects is the owner's call, so creating,
 * renaming and dropping one stays with the admin; a teacher only works inside the subjects they
 * were given.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/subjects")
public class AdminSubjectController {

    private final AdminSubjectService adminSubjectService;
    private final AdminLessonService adminLessonService;
    private final AdminQuestionService adminQuestionService;
    private final AdminSectionService adminSectionService;
    private final SubjectAccessGuard accessGuard;

    @GetMapping
    public ResponseEntity<List<SubjectDto>> subjects(@AuthUser CurrentUser user) {
        return ResponseEntity.ok(adminSubjectService.findAll(user));
    }

    @PostMapping
    public ResponseEntity<SubjectDto> create(@AuthUser CurrentUser user,
                                             @Valid @RequestBody SubjectRequest request) {
        accessGuard.requireAdmin(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminSubjectService.create(request));
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SubjectDto> update(@AuthUser CurrentUser user,
                                             @PathVariable Integer subjectId,
                                             @Valid @RequestBody SubjectRequest request) {
        accessGuard.requireAdmin(user);
        return ResponseEntity.ok(adminSubjectService.update(subjectId, request));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> delete(@AuthUser CurrentUser user, @PathVariable Integer subjectId) {
        accessGuard.requireAdmin(user);
        adminSubjectService.delete(subjectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{subjectId}/lessons")
    public ResponseEntity<List<AdminLessonItem>> lessons(@AuthUser CurrentUser user,
                                                         @PathVariable Integer subjectId) {
        accessGuard.requireSubject(user, subjectId);
        return ResponseEntity.ok(adminLessonService.findBySubject(subjectId));
    }

    /**
     * Sets the order the lessons are listed in. Which topic a lesson is under is not changed here,
     * so the order only takes effect within every topic.
     */
    @PutMapping("/{subjectId}/lessons/order")
    public ResponseEntity<List<AdminLessonItem>> reorderLessons(@AuthUser CurrentUser user,
                                                                @PathVariable Integer subjectId,
                                                                @Valid @RequestBody ReorderRequest request) {
        accessGuard.requireSubject(user, subjectId);
        return ResponseEntity.ok(adminLessonService.reorder(subjectId, request.ids()));
    }

    @GetMapping("/{subjectId}/sections")
    public ResponseEntity<List<AdminSectionItem>> sections(@AuthUser CurrentUser user,
                                                           @PathVariable Integer subjectId) {
        accessGuard.requireSubject(user, subjectId);
        return ResponseEntity.ok(adminSectionService.findBySubject(subjectId));
    }

    @PutMapping("/{subjectId}/sections/order")
    public ResponseEntity<List<AdminSectionItem>> reorderSections(@AuthUser CurrentUser user,
                                                                  @PathVariable Integer subjectId,
                                                                  @Valid @RequestBody ReorderRequest request) {
        accessGuard.requireSubject(user, subjectId);
        return ResponseEntity.ok(adminSectionService.reorder(subjectId, request.ids()));
    }

    /** Extra questions of this subject that appear in the practice tab only. */
    @GetMapping("/{subjectId}/practice-questions")
    public ResponseEntity<List<AdminQuestionDto>> practiceQuestions(@AuthUser CurrentUser user,
                                                                    @PathVariable Integer subjectId) {
        accessGuard.requireSubject(user, subjectId);
        return ResponseEntity.ok(adminQuestionService.findPracticeOnly(subjectId));
    }
}
