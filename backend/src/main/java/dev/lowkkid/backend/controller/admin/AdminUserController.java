package dev.lowkkid.backend.controller.admin;

import dev.lowkkid.backend.model.PageResponse;
import dev.lowkkid.backend.model.SubscriptionItem;
import dev.lowkkid.backend.model.admin.AdminUserDto;
import dev.lowkkid.backend.model.admin.AdminUserItem;
import dev.lowkkid.backend.model.admin.SubscriptionRequest;
import dev.lowkkid.backend.model.admin.UserRequest;
import dev.lowkkid.backend.service.admin.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Students and their paid access. Payment happens outside the app, so the dates are entered here
 * by hand.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<PageResponse<AdminUserItem>> users(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(PageResponse.of(adminUserService.search(
                search, PageRequest.of(page, size, Sort.by("username")))));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserDto> user(@PathVariable Integer userId) {
        return ResponseEntity.ok(adminUserService.get(userId));
    }

    @PostMapping
    public ResponseEntity<AdminUserDto> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.create(request));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<AdminUserDto> update(@PathVariable Integer userId,
                                               @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(adminUserService.update(userId, request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Integer userId) {
        adminUserService.delete(userId);
        return ResponseEntity.noContent().build();
    }

    /** Grants a subject to a student, or moves the paid until date of an existing one. */
    @PutMapping("/{userId}/subscriptions/{subjectId}")
    public ResponseEntity<SubscriptionItem> upsertSubscription(
            @PathVariable Integer userId,
            @PathVariable Integer subjectId,
            @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(adminUserService.upsertSubscription(userId, subjectId, request));
    }

    @DeleteMapping("/{userId}/subscriptions/{subjectId}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Integer userId,
                                                   @PathVariable Integer subjectId) {
        adminUserService.deleteSubscription(userId, subjectId);
        return ResponseEntity.noContent().build();
    }
}
