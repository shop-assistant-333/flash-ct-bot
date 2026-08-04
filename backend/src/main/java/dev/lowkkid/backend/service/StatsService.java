package dev.lowkkid.backend.service;

import dev.lowkkid.backend.model.PredictionDto;
import dev.lowkkid.backend.model.StatsDto;
import dev.lowkkid.backend.security.CurrentUser;

public interface StatsService {

    StatsDto statsOf(CurrentUser user, Integer subjectId);

    /**
     * AI estimate of the exam score, based on the last month of homework results so that recent
     * progress outweighs early mistakes. Never blocks on the model: a stale or missing estimate is
     * refreshed in the background and the response comes back with {@code pending = true} until the
     * fresh one is ready, so the caller should poll again shortly whenever that flag is set.
     */
    PredictionDto prediction(CurrentUser user, Integer subjectId);
}
