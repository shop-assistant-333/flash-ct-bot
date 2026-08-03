package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByTgId(String tgId);

    /** Matches the record an admin created by hand before the student ever opened the mini app. */
    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByTgId(String tgId);

    /**
     * @param pattern lower cased {@code %like%} pattern; a blank search goes through
     *                {@link #findAll(Pageable)} instead
     */
    @Query("""
            select u from User u
            where lower(coalesce(u.username, '')) like :pattern
               or lower(coalesce(u.firstName, '')) like :pattern
               or lower(coalesce(u.lastName, '')) like :pattern
               or lower(coalesce(u.tgId, '')) like :pattern
            """)
    Page<User> search(@Param("pattern") String pattern, Pageable pageable);
}
