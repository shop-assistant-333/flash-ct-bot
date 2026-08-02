package dev.lowkkid.backend.controller;

import dev.lowkkid.backend.model.PracticeAnswerResultDto;
import dev.lowkkid.backend.model.PracticeQuestionDto;
import dev.lowkkid.backend.model.StreakDto;
import dev.lowkkid.backend.model.SubmitAnswerRequest;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.PracticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Practice tab: an endless shuffled feed of questions of one subject, with no final score,
 * only a right/wrong verdict per question and the streak.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/practice")
public class PracticeController {

    private final PracticeService practiceService;

    /**
     * Question to show now. Safe to call again after a reload: the cursor only moves on an answer,
     * so the student lands back on the same question.
     */
    @GetMapping("/next")
    public ResponseEntity<PracticeQuestionDto> next(@RequestParam Integer subjectId,
                                                    @AuthUser CurrentUser user) {
        return ResponseEntity.ok(practiceService.next(user, subjectId));
    }

    @PostMapping("/answer")
    public ResponseEntity<PracticeAnswerResultDto> answer(@RequestParam Integer subjectId,
                                                          @Valid @RequestBody SubmitAnswerRequest request,
                                                          @AuthUser CurrentUser user) {
        return ResponseEntity.ok(practiceService.answer(user, subjectId, request));
    }

    @GetMapping("/streak")
    public ResponseEntity<StreakDto> streak(@AuthUser CurrentUser user) {
        return ResponseEntity.ok(practiceService.streak(user));
    }
}
