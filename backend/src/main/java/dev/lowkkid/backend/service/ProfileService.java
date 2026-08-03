package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.ProfileDto;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Profile tab: who the student is and which subjects they have paid for.
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final SubscriptionAccess subscriptionAccess;

    @Transactional(readOnly = true)
    public ProfileDto profileOf(CurrentUser user) {
        User student = userRepository.findById(user.id())
                .orElseThrow(() -> NotFoundException.of("User", user.id()));
        return new ProfileDto(
                student.getId(),
                student.getTgId(),
                student.getUsername(),
                student.getFirstName(),
                student.getLastName(),
                student.getRole(),
                subscriptionAccess.itemsOf(student.getId()));
    }
}
