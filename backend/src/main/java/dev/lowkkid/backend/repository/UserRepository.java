package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.User;
import dev.lowkkid.backend.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

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

    /** Subjects of a teacher as bare ids: the guard compares ids, it has no use for the entities. */
    @Query("select s.id from User u join u.taughtSubjects s where u.id = :userId")
    Set<Integer> findTaughtSubjectIds(@Param("userId") Integer userId);

    /**
     * Students a teacher is allowed to see: those granted any of their subjects. Access is not
     * filtered by {@code paidUntil} on purpose — a student whose payment ran out has to stay
     * visible, otherwise the teacher cannot tell where the person went.
     *
     * <p>{@code role} is bound as a parameter rather than written as an enum literal: an inline
     * one is rendered as a cast to the java class name ({@code 'USER'::UserRole}), which is not
     * what the postgres type is called.
     *
     * @param pattern lower cased {@code %like%} pattern, or {@code null} for no search
     */
    @Query("""
            select distinct u from User u
            join Subscription s on s.user = u
            where u.role = :role
              and s.subject.id in :subjectIds
              and (:pattern is null
                   or lower(coalesce(u.username, '')) like :pattern
                   or lower(coalesce(u.firstName, '')) like :pattern
                   or lower(coalesce(u.lastName, '')) like :pattern
                   or lower(coalesce(u.tgId, '')) like :pattern)
            """)
    Page<User> searchStudentsOfSubjects(@Param("role") UserRole role,
                                        @Param("subjectIds") Collection<Integer> subjectIds,
                                        @Param("pattern") String pattern,
                                        Pageable pageable);

    /** Teachers a subject is assigned to; a subject still taught cannot be dropped. */
    @Query("select count(u) from User u join u.taughtSubjects s where s.id = :subjectId")
    long countTeachersOfSubject(@Param("subjectId") Integer subjectId);
}
