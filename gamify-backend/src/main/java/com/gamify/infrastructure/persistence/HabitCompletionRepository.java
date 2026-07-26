package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {

    boolean existsByHabitIdAndDateCompletionAndAnnuleFalse(Long habitId, LocalDate dateCompletion);

    Optional<HabitCompletion> findByHabitIdAndDateCompletionAndAnnuleFalse(Long habitId, LocalDate dateCompletion);

    List<HabitCompletion> findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
            Long habitId, LocalDate dateCompletion);

    List<HabitCompletion> findByHabitIdAndAnnuleFalseOrderByDateCompletionAsc(Long habitId);
}
