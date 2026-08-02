package dev.lowkkid.backend.controller;

import dev.lowkkid.backend.model.PredictionDto;
import dev.lowkkid.backend.model.StatsDto;
import dev.lowkkid.backend.security.AuthUser;
import dev.lowkkid.backend.security.CurrentUser;
import dev.lowkkid.backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Statistics tab. The prediction is a separate call on purpose: it may hit an external model and
 * be slow, so the counters render first and the score fills in after.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public ResponseEntity<StatsDto> stats(@RequestParam Integer subjectId,
                                          @AuthUser CurrentUser user) {
        return ResponseEntity.ok(statsService.statsOf(user, subjectId));
    }

    @GetMapping("/prediction")
    public ResponseEntity<PredictionDto> prediction(@RequestParam Integer subjectId,
                                                    @AuthUser CurrentUser user) {
        return ResponseEntity.ok(statsService.prediction(user, subjectId));
    }
}
