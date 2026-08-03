package dev.lowkkid.backend.service;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.Subject;
import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserSubjectProgress;
import dev.lowkkid.backend.entity.UserSubjectProgressId;
import dev.lowkkid.backend.repository.UserSubjectProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * How far a student got inside a subject: lessons open one after another, so everything up to and
 * including the current lesson is unlocked and the rest carries a padlock.
 *
 * <p>Positions are taken from the place of a lesson in the ordered list rather than from the raw
 * {@code order} column, so that gaps or an order that was never filled in cannot lock a student
 * out.
 */
@Service
@RequiredArgsConstructor
public class ProgressService {

    private final UserSubjectProgressRepository progressRepository;

    /** Index of the last unlocked lesson, or {@code -1} when the subject has no lessons at all. */
    @Transactional(readOnly = true)
    public int unlockedThrough(Integer userId, Integer subjectId, List<Lesson> ordered) {
        if (ordered.isEmpty()) {
            return -1;
        }
        return progressRepository.findByUser_IdAndSubject_Id(userId, subjectId)
                .map(progress -> indexOf(ordered, progress.getCurrentLesson().getId()))
                .orElse(0);
    }

    /**
     * The same position, but writing down the starting one when the student opens the subject for
     * the first time.
     */
    @Transactional
    public int unlockedThroughOrStart(User user, Subject subject, List<Lesson> ordered) {
        if (ordered.isEmpty()) {
            return -1;
        }
        Optional<UserSubjectProgress> stored =
                progressRepository.findByUser_IdAndSubject_Id(user.getId(), subject.getId());
        if (stored.isPresent()) {
            return indexOf(ordered, stored.get().getCurrentLesson().getId());
        }
        save(user, subject, ordered.getFirst());
        return 0;
    }

    /**
     * Moves the pointer onto the lesson that follows the finished one. The pointer never goes
     * backwards, so finishing an old lesson again does not take away access to later ones.
     *
     * @return the lesson this completion opened, or {@code null} when there is nothing after it
     */
    @Transactional
    public Lesson unlockNext(User user, Subject subject, List<Lesson> ordered, Lesson completed) {
        int completedIndex = indexOf(ordered, completed.getId());
        if (completedIndex < 0 || completedIndex + 1 >= ordered.size()) {
            return null;
        }
        Lesson next = ordered.get(completedIndex + 1);
        UserSubjectProgress progress = progressRepository
                .findByUser_IdAndSubject_Id(user.getId(), subject.getId())
                .orElse(null);
        if (progress == null) {
            save(user, subject, next);
        } else if (indexOf(ordered, progress.getCurrentLesson().getId()) < completedIndex + 1) {
            progress.setCurrentLesson(next);
            progressRepository.save(progress);
        }
        return next;
    }

    /** Position of a lesson in the ordered list, {@code -1} when it is not part of it. */
    public int indexOf(List<Lesson> ordered, Integer lessonId) {
        for (int index = 0; index < ordered.size(); index++) {
            if (ordered.get(index).getId().equals(lessonId)) {
                return index;
            }
        }
        return -1;
    }

    private void save(User user, Subject subject, Lesson currentLesson) {
        UserSubjectProgress progress = new UserSubjectProgress();
        progress.setId(new UserSubjectProgressId(user.getId(), subject.getId()));
        progress.setUser(user);
        progress.setSubject(subject);
        progress.setCurrentLesson(currentLesson);
        progressRepository.save(progress);
    }
}
