package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminLessonDto;
import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.LessonRequest;
import dev.lowkkid.backend.model.admin.ReorderRequest;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/lessons")
public class AdminLessonController {

    private final AdminLessonService adminLessonService;
    private final AdminQuestionService adminQuestionService;

    @GetMapping("/{lessonId}")
    public ResponseEntity<AdminLessonDto> lesson(@PathVariable Integer lessonId) {
        return ResponseEntity.ok(adminLessonService.get(lessonId));
    }

    @PostMapping
    public ResponseEntity<AdminLessonDto> create(@Valid @RequestBody LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminLessonService.create(request));
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<AdminLessonDto> update(@PathVariable Integer lessonId,
                                                 @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(adminLessonService.update(lessonId, request));
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> delete(@PathVariable Integer lessonId) {
        adminLessonService.delete(lessonId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{lessonId}/questions")
    public ResponseEntity<List<AdminQuestionDto>> questions(@PathVariable Integer lessonId) {
        return ResponseEntity.ok(adminQuestionService.findByLesson(lessonId));
    }

    @PutMapping("/{lessonId}/questions/order")
    public ResponseEntity<List<AdminQuestionDto>> reorderQuestions(@PathVariable Integer lessonId,
                                                                   @Valid @RequestBody ReorderRequest request) {
        return ResponseEntity.ok(adminQuestionService.reorder(lessonId, request.ids()));
    }
}
