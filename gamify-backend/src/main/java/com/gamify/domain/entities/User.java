package com.gamify.domain.entities;

import com.gamify.domain.enums.Attribut;
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

    // Attributs RPG (alignés sur l'enum Attribut : INT/FOR/VIT/PRE/CHA/RES),
    // départ à 10 (domain.md) — VIT = Vitalité (décision projet).
    private int intelligence = 10;
    private int force = 10;
    private int vitalite = 10;
    private int precision = 10;
    private int charisme = 10;
    private int resistance = 10;

    // Progression
    private int xpTotal = 0;
    private int niveau = 1;
    private String titre = "Novice";

    /**
     * Gain +1 à la validation d'une activité (domain.md). Version minimale :
     * pas encore de malus/plancher/historisation ni de recalcul de niveau —
     * réservé à G1-T04/G1-T05, volontairement non traité ici.
     */
    public void appliquerGainAttribut(Attribut attribut) {
        switch (attribut) {
            case INT -> intelligence++;
            case FOR -> force++;
            case VIT -> vitalite++;
            case PRE -> precision++;
            case CHA -> charisme++;
            case RES -> resistance++;
        }
    }

    public void ajouterXp(int xp) {
        xpTotal += xp;
    }
}
