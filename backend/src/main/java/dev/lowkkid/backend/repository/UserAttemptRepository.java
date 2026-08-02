package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {
}
