package dev.lowkkid.backend.controller;

import dev.lowkkid.backend.model.AnswerResultDto;
import dev.lowkkid.backend.model.AttemptDto;
import dev.lowkkid.backend.model.AttemptResultDto;
import dev.lowkkid.backend.model.SubmitAnswerRequest;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Solving of a lesson. Each answer is stored right away, which is what makes the progress survive
 * the student closing telegram mid test.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    @GetMapping("/{attemptId}")
    public ResponseEntity<AttemptDto> attempt(@PathVariable Long attemptId,
                                              @AuthUser CurrentUser user) {
        return ResponseEntity.ok(attemptService.get(user, attemptId));
    }

    /** Answers one question and returns whether it was right, plus the explanation to show. */
    @PostMapping("/{attemptId}/answers")
    public ResponseEntity<AnswerResultDto> answer(@PathVariable Long attemptId,
                                                  @Valid @RequestBody SubmitAnswerRequest request,
                                                  @AuthUser CurrentUser user) {
        return ResponseEntity.ok(attemptService.submitAnswer(user, attemptId, request));
    }

    /** Finishes the lesson and unlocks the next one. */
    @PostMapping("/{attemptId}/complete")
    public ResponseEntity<AttemptResultDto> complete(@PathVariable Long attemptId,
                                                     @AuthUser CurrentUser user) {
        return ResponseEntity.ok(attemptService.complete(user, attemptId));
    }
}
