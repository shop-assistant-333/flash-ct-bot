package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.LessonKind;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.entity.Subscription;
import dev.lowkkid.backend.model.SubjectItem;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.SubscriptionRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository.SubjectAttemptCount;
import dev.lowkkid.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Subject switch of the homework and practice tabs.
 */
@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubscriptionRepository subscriptionRepository;
    private final LessonRepository lessonRepository;
    private final UserAttemptRepository attemptRepository;

    /** Subjects the student has ever paid for, expired ones included and flagged as inactive. */
    @Transactional(readOnly = true)
    public List<SubjectItem> subjectsOf(CurrentUser user) {
        Map<Integer, Long> completed = attemptRepository.countCompletedBySubject(user.id()).stream()
                .collect(Collectors.toMap(SubjectAttemptCount::getSubjectId, SubjectAttemptCount::getCount));

        return subscriptionRepository.findByUser_Id(user.id()).stream()
                .sorted(Comparator.comparing(subscription -> subscription.getSubject().getId()))
                .map(subscription -> toItem(subscription, completed))
                .toList();
    }

    private SubjectItem toItem(Subscription subscription, Map<Integer, Long> completed) {
        Subject subject = subscription.getSubject();
        return new SubjectItem(
                subject.getId(),
                subject.getName(),
                subscription.getPaidUntil(),
                SubscriptionAccess.isActive(subscription),
                lessonRepository.countBySubject_IdAndKind(subject.getId(), LessonKind.LESSON),
                completed.getOrDefault(subject.getId(), 0L).intValue());
    }
}
