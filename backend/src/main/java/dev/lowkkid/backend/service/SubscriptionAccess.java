package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.Subscription;
import dev.lowkkid.backend.exception.ForbiddenException;
import dev.lowkkid.backend.model.SubscriptionItem;
import dev.lowkkid.backend.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Paid access of a student to a subject, checked on every subject scoped call.
 *
 * <p>Content, that is lessons and practice, needs a subscription that is still running. Read only
 * surfaces such as the statistics keep working after the paid period is over, so that a student
 * does not lose the history of what they solved.
 */
@Service
@RequiredArgsConstructor
public class SubscriptionAccess {

    private final SubscriptionRepository subscriptionRepository;

    /**
     * @throws ForbiddenException with {@code SUBSCRIPTION_EXPIRED} if the subject was never bought
     *                            or the paid period has ended
     */
    @Transactional(readOnly = true)
    public Subscription requireActive(Integer userId, Integer subjectId) {
        Subscription subscription = require(userId, subjectId);
        if (!isActive(subscription)) {
            throw ForbiddenException.subscriptionExpired(subjectId);
        }
        return subscription;
    }

    /**
     * @throws ForbiddenException with {@code SUBSCRIPTION_EXPIRED} if the subject was never bought
     */
    @Transactional(readOnly = true)
    public Subscription require(Integer userId, Integer subjectId) {
        return subscriptionRepository.findByUser_IdAndSubject_Id(userId, subjectId)
                .orElseThrow(() -> ForbiddenException.subscriptionExpired(subjectId));
    }

    /** Every subject the student ever paid for, expired ones included and flagged as inactive. */
    @Transactional(readOnly = true)
    public List<SubscriptionItem> itemsOf(Integer userId) {
        return subscriptionRepository.findByUser_Id(userId).stream()
                .sorted(Comparator.comparing(subscription -> subscription.getSubject().getId()))
                .map(SubscriptionAccess::toItem)
                .toList();
    }

    public static SubscriptionItem toItem(Subscription subscription) {
        return new SubscriptionItem(
                subscription.getSubject().getId(),
                subscription.getSubject().getName(),
                subscription.getPaidUntil(),
                isActive(subscription));
    }

    public static boolean isActive(Subscription subscription) {
        return subscription.getPaidUntil() != null && subscription.getPaidUntil().isAfter(LocalDateTime.now());
    }
}
