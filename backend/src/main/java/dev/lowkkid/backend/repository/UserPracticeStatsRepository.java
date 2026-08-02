package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserPracticeStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPracticeStatsRepository extends JpaRepository<UserPracticeStats, Integer> {
}
