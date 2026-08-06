package dev.lowkkid.backend.service.admin;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.entity.Subscription;
import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserRole;
import dev.lowkkid.backend.entity.UserSubjectProgress;
import dev.lowkkid.backend.exception.ConflictException;
import dev.lowkkid.backend.exception.NotFoundException;
import dev.lowkkid.backend.model.StreakDto;
import dev.lowkkid.backend.model.SubscriptionItem;
import dev.lowkkid.backend.model.admin.AdminUserDto;
import dev.lowkkid.backend.model.admin.AdminUserItem;
import dev.lowkkid.backend.model.admin.SubscriptionRequest;
import dev.lowkkid.backend.model.admin.UserActivityItem;
import dev.lowkkid.backend.model.admin.UserProgressItem;
import dev.lowkkid.backend.model.admin.UserRequest;
import dev.lowkkid.backend.repository.LessonRepository;
import dev.lowkkid.backend.repository.SubjectRepository;
import dev.lowkkid.backend.repository.SubscriptionRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository;
import dev.lowkkid.backend.repository.UserAnswerRepository.Counters;
import dev.lowkkid.backend.repository.UserAttemptRepository;
import dev.lowkkid.backend.repository.UserAttemptRepository.SubjectAttemptCount;
import dev.lowkkid.backend.repository.UserPracticeStatsRepository;
import dev.lowkkid.backend.repository.UserRepository;
import dev.lowkkid.backend.repository.UserSessionRepository;
import dev.lowkkid.backend.repository.UserSubjectProgressRepository;
import dev.lowkkid.backend.service.AttemptService;
import dev.lowkkid.backend.service.SubscriptionAccess;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Students and their paid access.
 *
 * <p>Payment happens in an ordinary telegram chat, outside the app, so the dates are typed in by
 * hand here and nothing about them is computed. A student can also be created before ever opening
 * the mini app, knowing only the username: the telegram id stays empty and gets filled in on the
 * first launch.
 */
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final LessonRepository lessonRepository;
    private final UserAttemptRepository attemptRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserSessionRepository sessionRepository;
    private final UserSubjectProgressRepository progressRepository;
    private final UserPracticeStatsRepository practiceStatsRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserItem> search(String search, Pageable pageable) {
        Page<User> page = StringUtils.hasText(search)
                ? userRepository.search("%" + search.trim().toLowerCase() + "%", pageable)
                : userRepository.findAll(pageable);

        Map<Integer, List<SubscriptionItem>> subscriptions = subscriptionsOf(
                page.getContent().stream().map(User::getId).toList());
        return page.map(student -> toItem(student, subscriptions.getOrDefault(student.getId(), List.of())));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDto get(Integer userId) {
        return toDto(user(userId));
    }

    @Override
    @Transactional
    public AdminUserDto create(UserRequest request) {
        requireFreeUsername(request.username(), null);
        requireFreeTgId(request.tgId(), null);

        User student = new User();
        apply(student, request);
        return toDto(userRepository.save(student));
    }

    @Override
    @Transactional
    public AdminUserDto update(Integer userId, UserRequest request) {
        User student = user(userId);
        requireFreeUsername(request.username(), userId);
        requireFreeTgId(request.tgId(), userId);

        apply(student, request);
        return toDto(userRepository.save(student));
    }

    /** Removes the student along with everything recorded about them. */
    @Override
    @Transactional
    public void delete(Integer userId) {
        User student = user(userId);

        attemptRepository.deleteAll(attemptRepository.findByUser_Id(userId));
        progressRepository.deleteByUser_Id(userId);
        subscriptionRepository.deleteByUser_Id(userId);
        sessionRepository.deleteByUser_Id(userId);
        practiceStatsRepository.deleteById(userId);
        userRepository.delete(student);
    }

    /** Both "grant access" and "extend it": there is a single row per student and subject. */
    @Override
    @Transactional
    public SubscriptionItem upsertSubscription(Integer userId, Integer subjectId, SubscriptionRequest request) {
        User student = user(userId);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> NotFoundException.of("Subject", subjectId));

        Subscription subscription = subscriptionRepository.findByUser_IdAndSubject_Id(userId, subjectId)
                .orElseGet(() -> {
                    Subscription created = new Subscription();
                    created.setUser(student);
                    created.setSubject(subject);
                    return created;
                });
        subscription.setPaidUntil(request.paidUntil());

        return SubscriptionAccess.toItem(subscriptionRepository.save(subscription));
    }

    @Override
    @Transactional
    public void deleteSubscription(Integer userId, Integer subjectId) {
        Subscription subscription = subscriptionRepository.findByUser_IdAndSubject_Id(userId, subjectId)
                .orElseThrow(() -> NotFoundException.of("Subscription of subject " + subjectId + " of user", userId));
        subscriptionRepository.delete(subscription);
    }

    private void apply(User student, UserRequest request) {
        student.setUsername(request.username().trim());
        student.setTgId(StringUtils.hasText(request.tgId()) ? request.tgId().trim() : null);
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setRole(request.role() == null ? UserRole.USER : request.role());
    }

    /** The username is how a hand made record is matched to a student on their first launch. */
    private void requireFreeUsername(String username, Integer allowedId) {
        userRepository.findByUsernameIgnoreCase(username.trim())
                .filter(existing -> !existing.getId().equals(allowedId))
                .ifPresent(existing -> {
                    throw new ConflictException("Username " + existing.getUsername() + " is already taken");
                });
    }

    private void requireFreeTgId(String tgId, Integer allowedId) {
        if (!StringUtils.hasText(tgId)) {
            return;
        }
        userRepository.findByTgId(tgId.trim())
                .filter(existing -> !existing.getId().equals(allowedId))
                .ifPresent(existing -> {
                    throw new ConflictException("Telegram id " + tgId + " already belongs to another user");
                });
    }

    private AdminUserItem toItem(User student, List<SubscriptionItem> subscriptions) {
        return new AdminUserItem(
                student.getId(),
                student.getTgId(),
                student.getUsername(),
                student.getFirstName(),
                student.getLastName(),
                student.getRole(),
                subscriptions);
    }

    private AdminUserDto toDto(User student) {
        List<Subscription> subscriptions = subscriptionRepository.findByUser_Id(student.getId()).stream()
                .sorted(Comparator.comparing(subscription -> subscription.getSubject().getId()))
                .toList();
        return new AdminUserDto(
                student.getId(),
                student.getTgId(),
                student.getUsername(),
                student.getFirstName(),
                student.getLastName(),
                student.getRole(),
                subscriptions.stream().map(SubscriptionAccess::toItem).toList(),
                progressOf(student.getId(), subscriptions),
                activityOf(student.getId()));
    }

    /** Same numbers the student sees on their statistics tab, but summed over every subject. */
    private UserActivityItem activityOf(Integer userId) {
        Counters answers = userAnswerRepository.countAllSubjects(userId);
        StreakDto streak = practiceStatsRepository.findById(userId)
                .map(stats -> new StreakDto(
                        stats.getCurrentStreak() == null ? 0 : stats.getCurrentStreak(),
                        stats.getBestStreak() == null ? 0 : stats.getBestStreak()))
                .orElseGet(() -> new StreakDto(0, 0));

        return new UserActivityItem(
                (int) answers.getAnswered(),
                (int) answers.getCorrect(),
                AttemptService.accuracyPercent(answers.getCorrect(), answers.getAnswered()),
                sessionRepository.totalSecondsSpent(userId) / 60,
                streak);
    }

    /**
     * One row per paid subject, so the admin sees a subject the student has not opened yet as well
     * as the ones in progress.
     */
    private List<UserProgressItem> progressOf(Integer userId, List<Subscription> subscriptions) {
        Map<Integer, UserSubjectProgress> progress = progressRepository.findByUser_Id(userId).stream()
                .collect(Collectors.toMap(row -> row.getSubject().getId(), row -> row));
        Map<Integer, Long> completed = attemptRepository.countCompletedBySubject(userId).stream()
                .collect(Collectors.toMap(SubjectAttemptCount::getSubjectId, SubjectAttemptCount::getCount));

        List<UserProgressItem> items = new ArrayList<>(subscriptions.size());
        for (Subscription subscription : subscriptions) {
            Subject subject = subscription.getSubject();
            Lesson current = progress.containsKey(subject.getId())
                    ? progress.get(subject.getId()).getCurrentLesson()
                    : null;
            items.add(new UserProgressItem(
                    subject.getId(),
                    subject.getName(),
                    current == null ? null : current.getId(),
                    current == null ? null : current.getTitle(),
                    completed.getOrDefault(subject.getId(), 0L).intValue(),
                    lessonRepository.countBySubject_Id(subject.getId())));
        }
        return items;
    }

    /** Subscriptions of a whole page of the list at once, instead of one query per row. */
    private Map<Integer, List<SubscriptionItem>> subscriptionsOf(List<Integer> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return subscriptionRepository.findByUser_IdIn(userIds).stream()
                .sorted(Comparator.comparing(subscription -> subscription.getSubject().getId()))
                .collect(Collectors.groupingBy(
                        subscription -> subscription.getUser().getId(),
                        Collectors.mapping(SubscriptionAccess::toItem, Collectors.toList())));
    }

    private User user(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> NotFoundException.of("User", userId));
    }
}
