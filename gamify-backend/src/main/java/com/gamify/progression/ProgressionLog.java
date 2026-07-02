package com.gamify.progression;

import com.gamify.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
