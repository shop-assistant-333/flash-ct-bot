package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserSubjectProgress;
import dev.lowkkid.backend.entity.UserSubjectProgressId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSubjectProgressRepository extends JpaRepository<UserSubjectProgress, UserSubjectProgressId> {

    @EntityGraph(attributePaths = "currentLesson")
    Optional<UserSubjectProgress> findByUser_IdAndSubject_Id(Integer userId, Integer subjectId);

    @EntityGraph(attributePaths = {"subject", "currentLesson"})
    List<UserSubjectProgress> findByUser_Id(Integer userId);

    boolean existsByCurrentLesson_Id(Integer lessonId);

    void deleteByUser_Id(Integer userId);
}
