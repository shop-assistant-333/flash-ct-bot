package dev.lowkkid.backend.security;

import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.exception.UnauthorizedException;
import dev.lowkkid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

/**
 * Verifies the telegram {@code initData} payload and maps it onto a row of {@code users}.
 *
 * <p>The signature is the one described by the mini app documentation: the fields are sorted by
 * name, joined as {@code key=value} lines, and signed with a key derived from the bot token. A
 * payload that does not match, or that is older than {@code app.telegram.init-data-ttl}, is
 * rejected — there is no other login in the app, so this check is the whole authentication.
 *
 * <p>First launch registers the student. An admin may have created the record beforehand knowing
 * only the username, in which case that row is claimed instead of a second one being created, and
 * its telegram id is filled in.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramAuthService implements AuthService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final Set<String> UNSIGNED_FIELDS = Set.of("hash");

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.telegram.bot-token}")
    private String botToken;

    @Value("${app.telegram.init-data-ttl}")
    private Duration initDataTtl;

    @Override
    @Transactional
    public CurrentUser authenticate(String initData) {
        if (!StringUtils.hasText(botToken)) {
            log.error("app.telegram.bot-token is not configured, no request can be authenticated");
            throw new UnauthorizedException("Telegram authentication is not configured");
        }

        Map<String, String> fields = parse(initData);
        verifySignature(fields);
        verifyFreshness(fields);

        User student = resolve(telegramUser(fields));
        return new CurrentUser(student.getId(), student.getTgId(), student.getUsername(),
                student.getRole(), taughtSubjectIdsOf(student));
    }

    /**
     * Only a teacher is bound to subjects, and every request of every student would otherwise pay
     * for the extra select.
     */
    private Set<Integer> taughtSubjectIdsOf(User student) {
        return student.getRole() == UserRole.TEACHER
                ? userRepository.findTaughtSubjectIds(student.getId())
                : Set.of();
    }

    /** initData is a query string; the signed values are the decoded ones. */
    private static Map<String, String> parse(String initData) {
        Map<String, String> fields = new TreeMap<>();
        for (String pair : initData.split("&")) {
            int separator = pair.indexOf('=');
            if (separator <= 0) {
                throw new UnauthorizedException("Malformed initData payload");
            }
            fields.put(decode(pair.substring(0, separator)), decode(pair.substring(separator + 1)));
        }
        return fields;
    }

    private static String decode(String value) {
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException exception) {
            throw new UnauthorizedException("Malformed initData payload");
        }
    }

    private void verifySignature(Map<String, String> fields) {
        String hash = fields.get("hash");
        if (!StringUtils.hasText(hash)) {
            throw new UnauthorizedException("initData carries no hash");
        }

        StringBuilder checkString = new StringBuilder();
        for (Map.Entry<String, String> field : fields.entrySet()) {
            if (UNSIGNED_FIELDS.contains(field.getKey())) {
                continue;
            }
            if (!checkString.isEmpty()) {
                checkString.append('\n');
            }
            checkString.append(field.getKey()).append('=').append(field.getValue());
        }

        byte[] secret = hmac("WebAppData".getBytes(StandardCharsets.UTF_8),
                botToken.getBytes(StandardCharsets.UTF_8));
        String expected = HexFormat.of().formatHex(
                hmac(secret, checkString.toString().getBytes(StandardCharsets.UTF_8)));
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                hash.toLowerCase().getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("initData signature does not match");
        }
    }

    /** Keeps a captured payload from being replayed forever. */
    private void verifyFreshness(Map<String, String> fields) {
        String authDate = fields.get("auth_date");
        if (!StringUtils.hasText(authDate)) {
            throw new UnauthorizedException("initData carries no auth_date");
        }
        Instant issuedAt;
        try {
            issuedAt = Instant.ofEpochSecond(Long.parseLong(authDate));
        } catch (NumberFormatException exception) {
            throw new UnauthorizedException("initData carries a malformed auth_date");
        }
        if (issuedAt.plus(initDataTtl).isBefore(Instant.now())) {
            throw new UnauthorizedException("initData has expired");
        }
    }

    private TelegramUser telegramUser(Map<String, String> fields) {
        String payload = fields.get("user");
        if (!StringUtils.hasText(payload)) {
            throw new UnauthorizedException("initData carries no user");
        }
        try {
            JsonNode node = objectMapper.readTree(payload);
            String tgId = node.path("id").asString(null);
            if (!StringUtils.hasText(tgId)) {
                throw new UnauthorizedException("initData user carries no id");
            }
            return new TelegramUser(tgId,
                    text(node, "username"),
                    text(node, "first_name"),
                    text(node, "last_name"));
        } catch (JacksonException exception) {
            throw new UnauthorizedException("initData user is not valid json");
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asString();
    }

    /**
     * The student, claiming the record an admin may have prepared under the same username before
     * the first launch.
     */
    private User resolve(TelegramUser telegramUser) {
        User student = userRepository.findByTgId(telegramUser.tgId())
                .or(() -> claimable(telegramUser.username()))
                .orElseGet(User::new);

        student.setTgId(telegramUser.tgId());
        if (StringUtils.hasText(telegramUser.username())) {
            student.setUsername(telegramUser.username());
        }
        if (StringUtils.hasText(telegramUser.firstName())) {
            student.setFirstName(telegramUser.firstName());
        }
        if (StringUtils.hasText(telegramUser.lastName())) {
            student.setLastName(telegramUser.lastName());
        }
        if (student.getRole() == null) {
            student.setRole(UserRole.USER);
        }
        return userRepository.save(student);
    }

    /** A hand made record only counts as this student while it has no telegram id of its own. */
    private Optional<User> claimable(String username) {
        if (!StringUtils.hasText(username)) {
            return Optional.empty();
        }
        return userRepository.findByUsernameIgnoreCase(username)
                .filter(candidate -> !StringUtils.hasText(candidate.getTgId()));
    }

    private static byte[] hmac(byte[] key, byte[] message) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(key, HMAC_SHA256));
            return mac.doFinal(message);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("HMAC-SHA256 is not available", exception);
        }
    }

    private record TelegramUser(String tgId, String username, String firstName, String lastName) {
    }
}
