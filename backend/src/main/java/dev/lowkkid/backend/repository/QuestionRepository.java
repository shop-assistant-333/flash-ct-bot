package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.LessonKind;
import dev.lowkkid.backend.entity.Question;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Integer> {

    @EntityGraph(attributePaths = "answerOptions")
    Optional<Question> findWithOptionsById(Integer id);

    @EntityGraph(attributePaths = "answerOptions")
    List<Question> findByLesson_IdOrderByOrderAsc(Integer lessonId);

    /** Part of the practice deck that comes from the homework of a subject; tests stay out of it. */
    @EntityGraph(attributePaths = "answerOptions")
    List<Question> findByLesson_Subject_IdAndLesson_Kind(Integer subjectId, LessonKind kind);

    /** Questions attached straight to the subject: those live only in the practice tab. */
    @EntityGraph(attributePaths = "answerOptions")
    List<Question> findBySubject_IdOrderByIdAsc(Integer subjectId);

    int countBySubject_Id(Integer subjectId);

    /**
     * Subject that owns the question, whichever way it is attached — straight to a subject, or to
     * a lesson of one. The join has to be a left one: a practice question has no lesson.
     */
    @Query("""
            select coalesce(q.subject.id, l.subject.id)
            from Question q
            left join q.lesson l
            where q.id = :questionId
            """)
    Optional<Integer> findSubjectId(@Param("questionId") Integer questionId);

    /** Question counts of every lesson of a subject, instead of counting one lesson at a time. */
    @Query("""
            select q.lesson.id as lessonId, count(q) as count
            from Question q
            where q.lesson.subject.id = :subjectId
            group by q.lesson.id
            """)
    List<LessonQuestionCount> countByLessonOfSubject(@Param("subjectId") Integer subjectId);

    interface LessonQuestionCount {

        Integer getLessonId();

        long getCount();
    }
}
