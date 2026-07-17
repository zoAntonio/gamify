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

    // Chemin de la photo de profil uploadée (ex. avatars/uuid.jpg), null si aucune.
    @Column(name = "avatar_image")
    private String avatarImage;

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

    // Titres par niveau (G1-T05) : au-delà du dernier, on reste Légende.
    private static final String[] TITRES = {
            "Novice", "Initié", "Combattant", "Guerrier",
            "Vétéran", "Élite", "Maître", "Légende",
    };

    /**
     * Gain +1 à la validation d'une activité / check d'habitude (domain.md).
     * Toujours minimal côté pertes : malus −2/−3, plancher et pénalité de minuit
     * restent le périmètre non traité de G1-T04.
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

    public int getValeurAttribut(Attribut attribut) {
        return switch (attribut) {
            case INT -> intelligence;
            case FOR -> force;
            case VIT -> vitalite;
            case PRE -> precision;
            case CHA -> charisme;
            case RES -> resistance;
        };
    }

    /**
     * Ajoute de l'XP et recalcule niveau/titre (G1-T05) : seuils doublants —
     * le niveau n est atteint à 100·(2^(n−1)−1) XP cumulés (100, 300, 700...).
     * Le niveau ne baisse jamais (domain.md) ; l'XP ne fait que croître.
     */
    public void ajouterXp(int xp) {
        xpTotal += xp;
        while (xpTotal >= seuilXpPourNiveau(niveau + 1)) {
            niveau++;
        }
        titre = TITRES[Math.min(niveau - 1, TITRES.length - 1)];
    }

    /** XP cumulés requis pour atteindre le niveau donné (plafonné pour éviter tout débordement). */
    public static int seuilXpPourNiveau(int niveauCible) {
        if (niveauCible >= 25) return Integer.MAX_VALUE; // ~1,6 Md d'XP — inatteignable
        return 100 * ((1 << (niveauCible - 1)) - 1);
    }
}
