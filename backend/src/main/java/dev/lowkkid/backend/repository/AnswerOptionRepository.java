package dev.lowkkid.backend.repository;

import dev.lowkkid.backend.entity.AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Integer> {

    List<AnswerOption> findByIdIn(Collection<Integer> ids);
}
