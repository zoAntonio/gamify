package com.gamify.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Log append-only : n'hérite pas de BaseEntity (même patron que ProgressionLog),
 * une série cassée conserve l'historique — on n'efface jamais les données passées
 * (domain.md).
 */
@Entity
@Table(
        name = "habit_completions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_habit_completions_habit_date",
                columnNames = {"habit_id", "date_completion"}
        )
)
@Data
@NoArgsConstructor
public class HabitCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(name = "date_completion", nullable = false)
    private LocalDate dateCompletion;
}
