package dev.lowkkid.backend.service.prediction;

import dev.lowkkid.backend.config.AiProperties;
import dev.lowkkid.backend.exception.ApiException;
import dev.lowkkid.backend.exception.ErrorCode;
import dev.lowkkid.backend.model.LessonStatsItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

/**
 * Asks an external model for the estimate.
 *
 * <p>Talks the chat completions dialect, which every provider worth using speaks, and asks for a
 * json object back so the answer can be read as a number and a sentence instead of being parsed
 * out of prose. Anything that goes wrong on the way surfaces as
 * {@code PREDICTION_UNAVAILABLE}: the statistics tab draws its counters first and fills the score
 * in afterwards, so a missing estimate costs a line on the screen and nothing else.
 */
@Slf4j
public class AiScorePredictor implements ScorePredictor {

    private final AiProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public AiScorePredictor(AiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.timeout());
        requestFactory.setReadTimeout(properties.timeout());
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + properties.apiKey())
                .build();
    }

    @Override
    public Prediction predict(Input input) {
        JsonNode answer = ask(userMessage(input));
        Integer score = answer.path("score").isNumber() ? answer.path("score").asInt() : null;
        String comment = answer.path("comment").asString("");

        if (score == null || comment.isBlank()) {
            log.warn("Model {} answered without a usable score: {}", properties.model(), answer);
            throw unavailable("The model returned no usable estimate");
        }
        return new Prediction(Math.clamp(score, 0, 100), comment);
    }

    private JsonNode ask(String question) {
        Map<String, Object> request = Map.of(
                "model", properties.model(),
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", properties.systemPrompt()),
                        Map.of("role", "user", "content", question)));

        try {
            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw unavailable("The model returned an empty response");
            }
            return objectMapper.readTree(response.path("choices").path(0).path("message")
                    .path("content").asString("{}"));
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            log.warn("Score prediction call to {} failed", properties.baseUrl(), exception);
            throw unavailable("The score prediction service is not reachable right now");
        }
    }

    /**
     * The facts of the student, in the shape the prompt promises. Topics with no answers at all
     * are listed too: "never practised" is what a bare accuracy number hides.
     */
    private static String userMessage(Input input) {
        StringBuilder message = new StringBuilder()
                .append("Предмет: ").append(input.subjectName()).append('\n')
                .append("Окно статистики: последние ").append(input.windowDays()).append(" дней\n")
                .append("Всего ответов за окно: ").append(input.window().answered())
                .append(", из них верных: ").append(input.window().correct())
                .append(" (").append(input.window().accuracyPercent()).append("%)\n")
                .append("Пройдено уроков: ").append(input.lessonsCompleted())
                .append(" из ").append(input.lessonsTotal()).append("\n")
                .append("Результаты по темам:\n");

        for (LessonStatsItem lesson : input.byLesson()) {
            message.append("- ").append(lesson.title()).append(": ");
            if (lesson.total() == 0) {
                message.append("тема не решалась");
            } else {
                message.append(lesson.correct()).append('/').append(lesson.total())
                        .append(" (").append(lesson.accuracyPercent()).append("%)");
            }
            message.append('\n');
        }
        return message.toString();
    }

    private static ApiException unavailable(String message) {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.PREDICTION_UNAVAILABLE, message);
    }
}
