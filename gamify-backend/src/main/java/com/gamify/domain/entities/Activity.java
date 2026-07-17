package com.gamify.domain.entities;

import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.Frequence;
import com.gamify.domain.enums.StatutKanban;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Activity extends BaseEntity {

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

    @Enumerated(EnumType.STRING)
    private Frequence frequence;

    private String objectif; // ex. "5 exercices" — descriptif, pas encore de suivi de ratio (G1-T09)

    private int xpRecompense = 50;

    @Enumerated(EnumType.STRING)
    private StatutKanban statut = StatutKanban.A_FAIRE;

    private boolean confirme = false; // irréversible après confirmation

    private LocalDateTime completedAt;
}
