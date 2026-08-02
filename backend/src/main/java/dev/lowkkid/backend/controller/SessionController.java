package dev.lowkkid.backend.controller;

import dev.lowkkid.backend.model.SessionDto;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * App lifecycle. {@code start} is the first call the mini app makes: it registers the user on
 * first launch and returns the profile the frontend renders the tabs from.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/session")
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/start")
    public ResponseEntity<SessionDto> start(@AuthUser CurrentUser user) {
        return ResponseEntity.ok(sessionService.start(user));
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(@AuthUser CurrentUser user) {
        sessionService.heartbeat(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/end")
    public ResponseEntity<Void> end(@AuthUser CurrentUser user) {
        sessionService.end(user);
        return ResponseEntity.noContent().build();
    }
}
