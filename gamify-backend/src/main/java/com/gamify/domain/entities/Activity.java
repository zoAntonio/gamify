package com.gamify.domain.entities;

import com.gamify.domain.enums.StatutKanban;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String nom;

    private String domaine;         // Maths, Sport, Langues...
    private String attributCible;   // intelligence, force, vitesse...
    private String frequence;       // quotidien, hebdo, mensuel
    private int xpRecompense = 50;

    @Enumerated(EnumType.STRING)
    private StatutKanban statut = StatutKanban.A_FAIRE;

    private boolean confirme = false; // irréversible après confirmation

    private LocalDateTime completedAt;
}
