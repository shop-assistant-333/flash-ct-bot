package dev.lowkkid.backend.config;

import dev.lowkkid.backend.service.prediction.AiScorePredictor;
import dev.lowkkid.backend.service.prediction.LocalScorePredictor;
import dev.lowkkid.backend.service.prediction.ScorePredictor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ObjectMapper;

/**
 * Picks where the exam score estimate comes from. The model is used as soon as a key is
 * configured; until then the local estimate keeps the statistics tab whole instead of leaving a
 * failing call at the top of it.
 */
@Configuration
@EnableConfigurationProperties(AiProperties.class)
@Slf4j
public class PredictionConfig {

    @Bean
    public ScorePredictor scorePredictor(AiProperties properties, ObjectMapper objectMapper) {
        if (!properties.isConfigured()) {
            log.warn("app.ai.api-key is not set: exam score estimates are computed locally, not by a model");
            return new LocalScorePredictor();
        }
        log.info("Exam score estimates are asked of {} at {}", properties.model(), properties.baseUrl());
        return new AiScorePredictor(properties, objectMapper);
    }
}
