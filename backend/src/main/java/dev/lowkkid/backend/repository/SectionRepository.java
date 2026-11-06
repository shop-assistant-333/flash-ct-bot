package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SectionRepository extends JpaRepository<Section, Integer> {

    /** Topics of a subject in the order the admin arranged them. */
    List<Section> findBySubject_IdOrderByOrderAsc(Integer subjectId);

    /** Subject that owns the topic, without loading either — what the access guard needs. */
    @Query("select s.subject.id from Section s where s.id = :sectionId")
    Optional<Integer> findSubjectId(@Param("sectionId") Integer sectionId);
}
