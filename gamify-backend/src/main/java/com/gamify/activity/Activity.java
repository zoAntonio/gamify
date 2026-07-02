package com.gamify.activity;

import com.gamify.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    public enum StatutKanban {
        A_FAIRE, EN_COURS, TERMINE
    }
}
