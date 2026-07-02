package com.gamify.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Attributs RPG
    private int intelligence = 0;
    private int force = 0;
    private int vitesse = 0;
    private int vitalite = 0;
    private int charisme = 0;
    private int resistance = 0;
    private int precision = 0;

    // Progression
    private int xpTotal = 0;
    private int niveau = 1;
    private String titre = "Novice";

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
