package dev.lowkkid.backend.security;

import dev.lowkkid.backend.exception.ForbiddenException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Guards {@code /api/admin/**}, which is reachable by the ADMIN and the TEACHER roles.
 *
 * <p>This is the coarse filter only: whether a teacher may touch one particular lesson or question
 * depends on the subject that owns it, which a path pattern cannot express. That check lives in
 * {@link SubjectAccessGuard} and is made by the admin controllers themselves.
 */
@Component
public class AdminAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }

        Object currentUser = request.getAttribute(AuthenticationInterceptor.CURRENT_USER_ATTRIBUTE);
        if (!(currentUser instanceof CurrentUser user) || (!user.isAdmin() && !user.isTeacher())) {
            throw new ForbiddenException("Admin or teacher role required");
        }
        return true;
    }
}
