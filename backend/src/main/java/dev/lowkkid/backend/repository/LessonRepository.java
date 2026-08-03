package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {

    /** Lessons of a subject in the order the admin arranged them, which is also the unlock order. */
    List<Lesson> findBySubject_IdOrderByOrderAsc(Integer subjectId);

    int countBySubject_Id(Integer subjectId);
}
