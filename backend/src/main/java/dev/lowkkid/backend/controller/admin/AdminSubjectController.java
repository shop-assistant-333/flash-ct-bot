package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminLessonItem;
import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.ReorderRequest;
import dev.lowkkid.backend.model.admin.SubjectDto;
import dev.lowkkid.backend.model.admin.SubjectRequest;
import dev.lowkkid.backend.service.admin.AdminLessonService;
import dev.lowkkid.backend.service.admin.AdminQuestionService;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/subjects")
public class AdminSubjectController {

    private final AdminSubjectService adminSubjectService;
    private final AdminLessonService adminLessonService;
    private final AdminQuestionService adminQuestionService;

    @GetMapping
    public ResponseEntity<List<SubjectDto>> subjects() {
        return ResponseEntity.ok(adminSubjectService.findAll());
    }

    @PostMapping
    public ResponseEntity<SubjectDto> create(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminSubjectService.create(request));
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SubjectDto> update(@PathVariable Integer subjectId,
                                             @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(adminSubjectService.update(subjectId, request));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> delete(@PathVariable Integer subjectId) {
        adminSubjectService.delete(subjectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{subjectId}/lessons")
    public ResponseEntity<List<AdminLessonItem>> lessons(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(adminLessonService.findBySubject(subjectId));
    }

    /** Sets the order in which the student unlocks the lessons of this subject. */
    @PutMapping("/{subjectId}/lessons/order")
    public ResponseEntity<List<AdminLessonItem>> reorderLessons(@PathVariable Integer subjectId,
                                                                @Valid @RequestBody ReorderRequest request) {
        return ResponseEntity.ok(adminLessonService.reorder(subjectId, request.ids()));
    }

    /** Extra questions of this subject that appear in the practice tab only. */
    @GetMapping("/{subjectId}/practice-questions")
    public ResponseEntity<List<AdminQuestionDto>> practiceQuestions(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(adminQuestionService.findPracticeOnly(subjectId));
    }
}
