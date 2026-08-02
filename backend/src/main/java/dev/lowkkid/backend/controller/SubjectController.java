package dev.lowkkid.backend.controller;

import dev.lowkkid.backend.model.SubjectItem;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Subjects the student bought; the homework and practice tabs are always scoped to one of them.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectItem>> mySubjects(@AuthUser CurrentUser user) {
        return ResponseEntity.ok(subjectService.subjectsOf(user));
    }
}
