package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.model.SubscriptionItem;
import dev.lowkkid.backend.model.admin.AdminUserDto;
import dev.lowkkid.backend.model.admin.AdminUserItem;
import dev.lowkkid.backend.model.admin.SubscriptionRequest;
import dev.lowkkid.backend.model.admin.UserRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {

    /** @param search matched against username, first name and telegram id; ignored when blank */
    Page<AdminUserItem> search(String search, Pageable pageable);

    AdminUserDto get(Integer userId);

    AdminUserDto create(UserRequest request);

    AdminUserDto update(Integer userId, UserRequest request);

    void delete(Integer userId);

    /** Sets the paid until date of a subject for a student, creating the access if it is new. */
    SubscriptionItem upsertSubscription(Integer userId, Integer subjectId, SubscriptionRequest request);

    void deleteSubscription(Integer userId, Integer subjectId);
}
