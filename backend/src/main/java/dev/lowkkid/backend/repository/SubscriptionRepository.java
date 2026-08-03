package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.Subscription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    @EntityGraph(attributePaths = "subject")
    List<Subscription> findByUser_Id(Integer userId);

    @EntityGraph(attributePaths = "subject")
    Optional<Subscription> findByUser_IdAndSubject_Id(Integer userId, Integer subjectId);

    /** Subscriptions of a whole page of the admin user list, in one query. */
    @EntityGraph(attributePaths = "subject")
    List<Subscription> findByUser_IdIn(Collection<Integer> userIds);

    boolean existsBySubject_Id(Integer subjectId);

    void deleteByUser_Id(Integer userId);
}
