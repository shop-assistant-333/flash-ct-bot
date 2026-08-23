package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.SubscriptionItem;
import dev.lowkkid.backend.model.admin.AdminUserDto;
import dev.lowkkid.backend.model.admin.AdminUserItem;
import dev.lowkkid.backend.model.admin.SubscriptionRequest;
import dev.lowkkid.backend.model.admin.TaughtSubjectItem;
import dev.lowkkid.backend.model.admin.UserRequest;
import dev.lowkkid.backend.security.CurrentUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {

    /**
     * Everybody for an admin; for a teacher, only the students granted one of their subjects.
     *
     * @param search matched against username, first name and telegram id; ignored when blank
     */
    Page<AdminUserItem> search(CurrentUser user, String search, Pageable pageable);

    /**
     * @throws dev.lowkkid.backend.exception.NotFoundException if a teacher asks for somebody who
     *                                                         is not a student of theirs
     */
    AdminUserDto get(CurrentUser user, Integer userId);

    AdminUserDto create(UserRequest request);

    AdminUserDto update(Integer userId, UserRequest request);

    void delete(Integer userId);

    /** Sets the paid until date of a subject for a student, creating the access if it is new. */
    SubscriptionItem upsertSubscription(Integer userId, Integer subjectId, SubscriptionRequest request);

    void deleteSubscription(Integer userId, Integer subjectId);

    /**
     * Puts a subject under a teacher; repeating it changes nothing.
     *
     * @throws dev.lowkkid.backend.exception.ConflictException if the user is not a teacher
     */
    TaughtSubjectItem assignSubject(Integer userId, Integer subjectId);

    void unassignSubject(Integer userId, Integer subjectId);
}
