package com.gamify.domain.entities;

import com.gamify.domain.enums.Attribut;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "habits")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Habit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domaine_id")
    private Domaine domaine;

    @Enumerated(EnumType.STRING)
    @Column(name = "attribut_cible")
    private Attribut attributCible;

    private String icone; // emoji affiché sur la carte

    private String couleur; // hex, teinte la grille de contributions

    private int xpRecompense = 10;

    // Record personnel — conservé séparément du streak courant (domain.md),
    // le streak courant se recalcule depuis les completions.
    private int meilleurStreak = 0;

    // Suppression logique (même patron que Domaine.actif) : HabitCompletion est
    // append-only, une suppression physique casserait l'historique/les badges déjà
    // débloqués sur cette habitude. Une habitude désactivée disparaît des listes et
    // devient inaccessible (check/édition), sans perdre son historique.
    private boolean actif = true;
}
