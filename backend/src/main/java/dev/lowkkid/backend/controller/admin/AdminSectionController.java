package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.admin.AdminSectionItem;
import dev.lowkkid.backend.model.admin.SectionRequest;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.security.SubjectAccessGuard;
import dev.lowkkid.backend.service.admin.AdminSectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Topics of a subject. A teacher has the same rights here as an admin, within their own subjects.
 * The list and the order of the topics live under {@code /api/admin/subjects/{id}/sections}.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/sections")
public class AdminSectionController {

    private final AdminSectionService adminSectionService;
    private final SubjectAccessGuard accessGuard;

    @PostMapping
    public ResponseEntity<AdminSectionItem> create(@AuthUser CurrentUser user,
                                                   @Valid @RequestBody SectionRequest request) {
        accessGuard.requireSubject(user, request.subjectId());
        return ResponseEntity.status(HttpStatus.CREATED).body(adminSectionService.create(request));
    }

    @PutMapping("/{sectionId}")
    public ResponseEntity<AdminSectionItem> update(@AuthUser CurrentUser user,
                                                   @PathVariable Integer sectionId,
                                                   @Valid @RequestBody SectionRequest request) {
        accessGuard.requireSection(user, sectionId);
        return ResponseEntity.ok(adminSectionService.update(sectionId, request));
    }

    @DeleteMapping("/{sectionId}")
    public ResponseEntity<Void> delete(@AuthUser CurrentUser user, @PathVariable Integer sectionId) {
        accessGuard.requireSection(user, sectionId);
        adminSectionService.delete(sectionId);
        return ResponseEntity.noContent().build();
    }
}
