package dev.lowkkid.backend.security;

import dev.lowkkid.backend.exception.ForbiddenException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Guards {@code /api/admin/**}, which is reachable only by users with the ADMIN role.
 */
@Component
public class AdminAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }

        Object currentUser = request.getAttribute(AuthenticationInterceptor.CURRENT_USER_ATTRIBUTE);
        if (!(currentUser instanceof CurrentUser user) || !user.isAdmin()) {
            throw new ForbiddenException("Admin role required");
        }
        return true;
    }
}
