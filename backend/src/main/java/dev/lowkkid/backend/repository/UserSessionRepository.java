package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    /** Latest visit of the user; it stays open as long as the heartbeats keep arriving. */
    Optional<UserSession> findFirstByUser_IdOrderByStartedAtDesc(Integer userId);

    /** Seconds spent in the app over every visit, for the "time in the app" statistic. */
    @Query(value = """
            select coalesce(sum(extract(epoch from (coalesce(ended_at, started_at) - started_at)))::bigint, 0)
            from user_sessions
            where user_id = :userId
            """, nativeQuery = true)
    long totalSecondsSpent(@Param("userId") Integer userId);

    void deleteByUser_Id(Integer userId);
}
