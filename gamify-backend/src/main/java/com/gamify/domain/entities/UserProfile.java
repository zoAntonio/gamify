package com.gamify.domain.entities;

import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.Avatar;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Données de jeu (attributs RPG, XP/niveau/titre, avatar, domaines trackés) —
 * séparées des credentials ({@link User}) pour raison de sécurité (V15/V16) :
 * la table credentials, qui porte le mot de passe hashé, n'a plus besoin
 * d'être requêtée/modifiée à chaque gain de point.
 *
 * Relation 1-1 à clé partagée (@MapsId) : user_profiles.user_id EST users.id,
 * jamais un id auto-incrémenté indépendant. N'hérite pas de BaseEntity — son
 * id n'est pas généré (@GeneratedValue), il est repris de User via @MapsId,
 * même raisonnement que ProgressionLog/UserBadge qui n'en héritent pas non
 * plus. Relation volontairement unidirectionnelle (User ne référence pas
 * UserProfile en retour) pour éviter tout risque de récursion Lombok (@Data)
 * sur toString/equals si la relation devenait bidirectionnelle.
 */
@Entity
@Table(name = "user_profiles")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
public class UserProfile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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

    /**
     * Retrait symétrique de {@link #appliquerGainAttribut} : correction d'un gain
     * annulé (ex. complétion d'habitude décochée), jamais un malus punitif.
     */
    public void retirerGainAttribut(Attribut attribut) {
        switch (attribut) {
            case INT -> intelligence--;
            case FOR -> force--;
            case VIT -> vitalite--;
            case PRE -> precision--;
            case CHA -> charisme--;
            case RES -> resistance--;
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

    /**
     * Retrait symétrique de {@link #ajouterXp} : correction d'un gain annulé. Ne
     * touche jamais niveau/titre à la baisse (règle domain.md : le niveau ne
     * baisse jamais), seul xpTotal recule.
     */
    public void retirerXp(int xp) {
        xpTotal -= xp;
    }

    /** XP cumulés requis pour atteindre le niveau donné (plafonné pour éviter tout débordement). */
    public static int seuilXpPourNiveau(int niveauCible) {
        if (niveauCible >= 25) return Integer.MAX_VALUE; // ~1,6 Md d'XP — inatteignable
        return 100 * ((1 << (niveauCible - 1)) - 1);
    }
}
