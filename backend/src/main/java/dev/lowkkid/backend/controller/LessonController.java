package dev.lowkkid.backend.controller;

import dev.lowkkid.backend.model.AttemptDto;
import dev.lowkkid.backend.model.LessonItem;
import dev.lowkkid.backend.model.SectionItem;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.AttemptService;
import dev.lowkkid.backend.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Homework tab: lessons, tests and the topics they are grouped under.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LessonController {

    private final LessonService lessonService;
    private final AttemptService attemptService;

    @GetMapping("/lessons")
    public ResponseEntity<List<LessonItem>> lessonsForSubject(@RequestParam Integer subjectId,
                                                              @AuthUser CurrentUser user) {
        return ResponseEntity.ok(lessonService.lessonsOf(user, subjectId));
    }

    /** Topics the lessons above are grouped under. */
    @GetMapping("/sections")
    public ResponseEntity<List<SectionItem>> sectionsForSubject(@RequestParam Integer subjectId,
                                                                @AuthUser CurrentUser user) {
        return ResponseEntity.ok(lessonService.sectionsOf(user, subjectId));
    }

    /**
     * Opens a lesson: starts it, or resumes it exactly where the student left off. Returns the
     * questions and the answers already given, so this is the only call needed to render the test.
     */
    @PostMapping("/lessons/{lessonId}/attempt")
    public ResponseEntity<AttemptDto> openLesson(@PathVariable Integer lessonId,
                                                 @AuthUser CurrentUser user) {
        return ResponseEntity.ok(attemptService.startOrResume(user, lessonId));
    }
}
