package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {

    /** Guards the admin panel against two subjects the owner could not tell apart. */
    Optional<Subject> findByNameIgnoreCase(String name);
}
