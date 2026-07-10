package com.gamify.domain.entities;

import jakarta.persistence.Entity;
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
 * Log append-only : n'hérite pas de BaseEntity, un updatedAt n'aurait pas de sens
 * sur un historique immuable.
 */
@Entity
@Table(name = "progression_logs")
@Data
@NoArgsConstructor
public class ProgressionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int xpAvant;
    private int xpApres;
    private int delta;          // positif = gain, négatif = pénalité
    private String source;      // nom de l'activité concernée
    private String attribut;    // quel attribut a changé
    private LocalDateTime date = LocalDateTime.now();
}
