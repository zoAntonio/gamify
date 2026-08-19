package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {

    boolean existsByHabitIdAndDateCompletionAndAnnuleFalse(Long habitId, LocalDate dateCompletion);

    Optional<HabitCompletion> findByHabitIdAndDateCompletionAndAnnuleFalse(Long habitId, LocalDate dateCompletion);

    List<HabitCompletion> findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
            Long habitId, LocalDate dateCompletion);

    List<HabitCompletion> findByHabitIdAndAnnuleFalseOrderByDateCompletionAsc(Long habitId);

    @Query("""
            SELECT COUNT(hc) FROM HabitCompletion hc
            WHERE hc.habit.user.id = :userId
            AND hc.habit.domaine.id = :domaineId
            AND hc.annule = false
            AND hc.dateCompletion BETWEEN :debut AND :fin
            """)
    long countValideesDansDomaineEtPeriode(
            @Param("userId") Long userId,
            @Param("domaineId") Long domaineId,
            @Param("debut") LocalDate debut,
            @Param("fin") LocalDate fin
    );
}
