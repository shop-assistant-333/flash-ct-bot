package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserAnswer;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {

    @EntityGraph(attributePaths = "selectedOptions")
    List<UserAnswer> findByAttempt_Id(Long attemptId);

    boolean existsByAttempt_IdAndQuestion_Id(Long attemptId, Integer questionId);

    /** Answers to one question, which a deleted question takes down with it. */
    List<UserAnswer> findByQuestion_Id(Integer questionId);

    /**
     * Answers to the questions of one lesson. A question can be moved between lessons, so such an
     * answer may sit in an attempt of another lesson — deleting a lesson has to find it anyway.
     */
    List<UserAnswer> findByQuestion_Lesson_Id(Integer lessonId);

    long countByAttempt_Id(Long attemptId);

    /** Counters over every homework answer of the student in one subject. */
    @Query("""
            select count(a) as answered, count(case when a.correct = true then 1 end) as correct
            from UserAnswer a
            where a.attempt.user.id = :userId
              and a.attempt.lesson.subject.id = :subjectId
            """)
    Counters countAll(@Param("userId") Integer userId, @Param("subjectId") Integer subjectId);

    /** The same counters over every subject at once, for the admin card of a student. */
    @Query("""
            select count(a) as answered, count(case when a.correct = true then 1 end) as correct
            from UserAnswer a
            where a.attempt.user.id = :userId
            """)
    Counters countAllSubjects(@Param("userId") Integer userId);

    /** The same counters over a set of subjects, which is what a teacher sees of their student. */
    @Query("""
            select count(a) as answered, count(case when a.correct = true then 1 end) as correct
            from UserAnswer a
            where a.attempt.user.id = :userId
              and a.attempt.lesson.subject.id in :subjectIds
            """)
    Counters countAllOfSubjects(@Param("userId") Integer userId,
                                @Param("subjectIds") Collection<Integer> subjectIds);

    /** The same counters limited to a window, which is what the score prediction reasons over. */
    @Query("""
            select count(a) as answered, count(case when a.correct = true then 1 end) as correct
            from UserAnswer a
            where a.attempt.user.id = :userId
              and a.attempt.lesson.subject.id = :subjectId
              and a.answeredAt >= :from
            """)
    Counters countSince(@Param("userId") Integer userId,
                        @Param("subjectId") Integer subjectId,
                        @Param("from") LocalDateTime from);

    @Query("""
            select a.attempt.lesson.id as lessonId,
                   count(a) as answered,
                   count(case when a.correct = true then 1 end) as correct
            from UserAnswer a
            where a.attempt.user.id = :userId
              and a.attempt.lesson.subject.id = :subjectId
            group by a.attempt.lesson.id
            """)
    List<LessonCounters> countByLesson(@Param("userId") Integer userId, @Param("subjectId") Integer subjectId);

    /**
     * How many stored answers point at the given options: dropping such an option would rewrite
     * the history of a student.
     */
    @Query("select count(a) from UserAnswer a join a.selectedOptions o where o.id in :optionIds")
    long countAnswersUsingOptions(@Param("optionIds") Collection<Integer> optionIds);

    interface Counters {

        long getAnswered();

        long getCorrect();
    }

    interface LessonCounters {

        Integer getLessonId();

        long getAnswered();

        long getCorrect();
    }
}
