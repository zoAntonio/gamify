package com.gamify.domain.entities;

import com.gamify.domain.enums.Avatar;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Avatar avatar;

    @ManyToMany
    @JoinTable(
            name = "user_tracked_domains",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "domaine_id")
    )
    private Set<Domaine> domainesTrackes = new HashSet<>();

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
}
