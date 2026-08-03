package dev.lowkkid.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * External model the exam score estimate is asked for.
 *
 * <p>The endpoint is the chat completions one every provider exposes in the same shape, so the
 * owner can point this at whichever model turns out to be worth its price without a code change.
 * Leaving {@code api-key} empty keeps the app working: the estimate then comes from the local
 * arithmetic in {@link dev.lowkkid.backend.service.prediction.LocalScorePredictor}.
 *
 * @param systemPrompt describes how the exam is scored; the model does not reliably know the
 *                     belarusian ЦЭ/ЦТ rules, so they are spelled out rather than assumed
 */
@ConfigurationProperties(prefix = "app.ai")
public record AiProperties(String baseUrl,
                           String apiKey,
                           String model,
                           Duration timeout,
                           String systemPrompt) {

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
