package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {

    /** Lessons of a subject in the order the admin arranged them, which is also the unlock order. */
    List<Lesson> findBySubject_IdOrderByOrderAsc(Integer subjectId);

    int countBySubject_Id(Integer subjectId);

    /** Subject that owns the lesson, without loading either — what the access guard needs. */
    @Query("select l.subject.id from Lesson l where l.id = :lessonId")
    Optional<Integer> findSubjectId(@Param("lessonId") Integer lessonId);
}
