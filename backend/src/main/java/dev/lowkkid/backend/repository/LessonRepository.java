package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.Lesson;
import dev.lowkkid.backend.entity.LessonKind;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {

    /** Lessons of a subject in the order the admin arranged them, which is also the unlock order. */
    List<Lesson> findBySubject_IdOrderByOrderAsc(Integer subjectId);

    /** Rows of one kind only, in the same order: statistics count lessons and leave tests out. */
    List<Lesson> findBySubject_IdAndKindOrderByOrderAsc(Integer subjectId, LessonKind kind);

    int countBySubject_Id(Integer subjectId);

    int countBySubject_IdAndKind(Integer subjectId, LessonKind kind);

    List<Lesson> findBySection_Id(Integer sectionId);

    /** Whether the topic holds a test other than the given lesson: one test per topic. */
    @Query("""
            select count(l) > 0 from Lesson l
            where l.section.id = :sectionId
              and l.kind = dev.lowkkid.backend.entity.LessonKind.TEST
              and l.id <> :lessonId
            """)
    boolean hasOtherTest(@Param("sectionId") Integer sectionId, @Param("lessonId") Integer lessonId);

    /** Subject that owns the lesson, without loading either — what the access guard needs. */
    @Query("select l.subject.id from Lesson l where l.id = :lessonId")
    Optional<Integer> findSubjectId(@Param("lessonId") Integer lessonId);
}
