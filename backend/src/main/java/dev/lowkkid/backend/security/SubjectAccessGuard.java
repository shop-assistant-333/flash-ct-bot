package dev.lowkkid.backend.security;

import dev.lowkkid.backend.exception.ForbiddenException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.QuestionRepository;
import dev.lowkkid.backend.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * The fine grained half of the admin authorisation: whether this caller may touch this particular
 * resource. {@link AdminAccessInterceptor} only decides that the role may enter {@code
 * /api/admin/**} at all — which lesson belongs to which subject a path pattern cannot know.
 *
 * <p>Called from the admin controllers, at the boundary of the system, so that the services stay
 * free of the subject of rights.
 *
 * <p>Two different answers on purpose:
 * <ul>
 *   <li>403 {@code FORBIDDEN} — the operation is closed to the role whatever the resource is
 *       (editing users, creating or dropping a subject);</li>
 *   <li>404 {@code NOT_FOUND} — the resource exists but belongs to somebody else's subject.
 *       A teacher walking the ids must not be able to tell an existing subject from a missing one.</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class SubjectAccessGuard {

    private final LessonRepository lessonRepository;
    private final QuestionRepository questionRepository;
    private final SectionRepository sectionRepository;

    /** @throws ForbiddenException if the caller is not an admin */
    public void requireAdmin(CurrentUser user) {
        if (!user.isAdmin()) {
            throw new ForbiddenException("Admin role required");
        }
    }

    /** @throws NotFoundException if the subject is not one the caller teaches */
    public void requireSubject(CurrentUser user, Integer subjectId) {
        if (!user.manages(subjectId)) {
            throw NotFoundException.of("Subject", subjectId);
        }
    }

    @Transactional(readOnly = true)
    public void requireLesson(CurrentUser user, Integer lessonId) {
        if (user.isAdmin()) {
            return;
        }
        Integer subjectId = lessonRepository.findSubjectId(lessonId)
                .orElseThrow(() -> NotFoundException.of("Lesson", lessonId));
        if (!user.manages(subjectId)) {
            throw NotFoundException.of("Lesson", lessonId);
        }
    }

    @Transactional(readOnly = true)
    public void requireSection(CurrentUser user, Integer sectionId) {
        if (user.isAdmin()) {
            return;
        }
        Integer subjectId = sectionRepository.findSubjectId(sectionId)
                .orElseThrow(() -> NotFoundException.of("Section", sectionId));
        if (!user.manages(subjectId)) {
            throw NotFoundException.of("Section", sectionId);
        }
    }

    @Transactional(readOnly = true)
    public void requireQuestion(CurrentUser user, Integer questionId) {
        if (user.isAdmin()) {
            return;
        }
        Integer subjectId = questionRepository.findSubjectId(questionId)
                .orElseThrow(() -> NotFoundException.of("Question", questionId));
        if (!user.manages(subjectId)) {
            throw NotFoundException.of("Question", questionId);
        }
    }
}
