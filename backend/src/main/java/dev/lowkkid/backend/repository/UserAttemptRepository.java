package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {

    /**
     * The single run of a lesson by a student: homework is solved once, so an existing attempt is
     * resumed instead of a new one being started.
     */
    Optional<UserAttempt> findFirstByUser_IdAndLesson_IdOrderByStartedAtDesc(Integer userId, Integer lessonId);

    List<UserAttempt> findByUser_IdAndLesson_Subject_Id(Integer userId, Integer subjectId);

    List<UserAttempt> findByUser_Id(Integer userId);

    boolean existsByLesson_Id(Integer lessonId);

    /** Finished attempts with their lesson, newest first, for the progress card of the admin. */
    @Query("""
            select a
            from UserAttempt a
            join fetch a.lesson lesson
            join fetch lesson.subject
            where a.user.id = :userId and a.completedAt is not null
            order by a.completedAt desc
            """)
    List<UserAttempt> findCompletedWithLesson(@Param("userId") Integer userId);

    /** Lessons the student has finished, per subject, for the subject and progress cards. */
    @Query("""
            select a.lesson.subject.id as subjectId, count(a) as count
            from UserAttempt a
            where a.user.id = :userId and a.completedAt is not null
            group by a.lesson.subject.id
            """)
    List<SubjectAttemptCount> countCompletedBySubject(@Param("userId") Integer userId);

    interface SubjectAttemptCount {

        Integer getSubjectId();

        long getCount();
    }
}
