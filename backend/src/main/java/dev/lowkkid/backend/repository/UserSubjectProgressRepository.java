package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserSubjectProgress;
import dev.lowkkid.backend.entity.UserSubjectProgressId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSubjectProgressRepository extends JpaRepository<UserSubjectProgress, UserSubjectProgressId> {
}
