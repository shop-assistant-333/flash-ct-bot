package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminQuestionDto;
import dev.lowkkid.backend.model.admin.QuestionRequest;
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

    @GetMapping("/{questionId}")
    public ResponseEntity<AdminQuestionDto> question(@PathVariable Integer questionId) {
        return ResponseEntity.ok(adminQuestionService.get(questionId));
    }

    @PostMapping
    public ResponseEntity<AdminQuestionDto> create(@Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminQuestionService.create(request));
    }

    /** Replaces the question together with its whole set of options. */
    @PutMapping("/{questionId}")
    public ResponseEntity<AdminQuestionDto> update(@PathVariable Integer questionId,
                                                   @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(adminQuestionService.update(questionId, request));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> delete(@PathVariable Integer questionId) {
        adminQuestionService.delete(questionId);
        return ResponseEntity.noContent().build();
    }
}
