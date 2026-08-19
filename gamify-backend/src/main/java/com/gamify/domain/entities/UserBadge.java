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
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Déblocage d'un badge par un utilisateur pour une saison donnée — append-only
 * (même patron que HabitCompletion/ProgressionLog, pas de BaseEntity : un
 * déblocage est un événement immuable, jamais modifié ni supprimé). La saison
 * fait partie de la clé d'unicité : un même badge peut être regagné à chaque
 * nouvelle saison.
 */
@Entity
@Table(name = "user_badges")
@Data
@NoArgsConstructor
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_definition_id", nullable = false)
    private BadgeDefinition badgeDefinition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saison_id", nullable = false)
    private Saison saison;

    @Column(name = "date_obtention", nullable = false)
    private LocalDateTime dateObtention;
}
