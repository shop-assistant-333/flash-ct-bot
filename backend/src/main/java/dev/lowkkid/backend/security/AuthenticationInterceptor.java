package dev.lowkkid.backend.security;

import dev.lowkkid.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Authenticates every {@code /api/**} call and publishes the caller as a request attribute.
 */
@Component
@RequiredArgsConstructor
public class AuthenticationInterceptor implements HandlerInterceptor {

    public static final String INIT_DATA_HEADER = "X-Telegram-Init-Data";
    public static final String CURRENT_USER_ATTRIBUTE = "currentUser";

    private final AuthService authService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String initData = request.getHeader(INIT_DATA_HEADER);
        if (initData == null || initData.isBlank()) {
            throw new UnauthorizedException("Missing " + INIT_DATA_HEADER + " header");
        }
        request.setAttribute(CURRENT_USER_ATTRIBUTE, authService.authenticate(initData));
        return true;
    }
}
