package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {

    boolean existsByHabitIdAndDateCompletion(Long habitId, LocalDate dateCompletion);

    List<HabitCompletion> findByHabitIdAndDateCompletionGreaterThanEqualOrderByDateCompletionDesc(
            Long habitId, LocalDate dateCompletion);
}
