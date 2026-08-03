package dev.lowkkid.backend.service;

import dev.lowkkid.backend.model.PredictionDto;
import dev.lowkkid.backend.model.StatsDto;
import dev.lowkkid.backend.security.CurrentUser;

public interface StatsService {

    StatsDto statsOf(CurrentUser user, Integer subjectId);

    /**
     * AI estimate of the exam score, based on the last month of homework results so that recent
     * progress outweighs early mistakes. Results are cached, the call may hit an external model.
     */
    PredictionDto prediction(CurrentUser user, Integer subjectId);
}
