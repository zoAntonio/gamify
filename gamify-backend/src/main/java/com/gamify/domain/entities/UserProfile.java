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

import java.time.LocalDate;
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

    // Compteurs de jours consécutifs sans gain, un par attribut (G1-T04, domain.md :
    // malus −2/−3(PRE) par jour de manque, +−5 cumulé au 3e jour consécutif) — remis
    // à zéro dès qu'un gain a lieu ce jour-là, incrémenté par le job de minuit
    // (InactivityPenaltyService). Même choix de style que les 6 champs d'attributs
    // ci-dessus (champs plats + switch) plutôt qu'une Map, pour rester cohérent.
    private int joursSansActiviteIntelligence = 0;
    private int joursSansActiviteForce = 0;
    private int joursSansActiviteVitalite = 0;
    private int joursSansActivitePrecision = 0;
    private int joursSansActiviteCharisme = 0;
    private int joursSansActiviteResistance = 0;

    // Dernier jour (inclus) pour lequel le job de pénalités d'inactivité a été
    // évalué pour ce profil — évite une double application si le job est rejoué
    // pour une même date, et permet de rattraper les jours manqués (serveur arrêté)
    // en avançant d'un jour à la fois depuis cette date.
    private LocalDate derniereEvaluationPenalites = LocalDate.now();

    // Réglages notifications (G1-T12, domain.md "Notifications") : 3 catégories
    // activables/désactivables indépendamment. Le déclenchement effectif (rappel
    // 30 min avant, alerte 22h, célébration) est calculé côté frontend — ces 3
    // interrupteurs ne font que gagner/couper chaque catégorie, lus par
    // NotificationPreferencesService.
    private boolean notifRappelActif = true;
    private boolean notifFinJourneeActif = true;
    private boolean notifCelebrationActif = true;

    // Visibilité du profil (G2-T17, domain.md "Multi-utilisateurs") : opt-in
    // explicite, désactivé par défaut — un profil n'apparaît dans le classement
    // public/le fil d'activité que si l'utilisateur a lui-même activé ce
    // réglage (réflexion vie privée du ticket : rien n'est exposé sans action
    // volontaire). Lu/écrit par PrivacyPreferencesService, même patron que les
    // 3 booléens de notification ci-dessus.
    @Column(name = "profil_public", nullable = false)
    private boolean profilPublic = false;

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
        appliquerGainAttribut(attribut, 1);
    }

    /**
     * Gain d'un montant explicite (G2-T16, domain.md "Validation avec photo comme
     * preuve → +2 pts au lieu de +1") — {@link #appliquerGainAttribut(Attribut)}
     * délègue ici avec 1. Pas de plancher/plafond ici : seules les pertes sont
     * bornées (voir {@link #appliquerVariation}), un gain reste un gain.
     */
    public void appliquerGainAttribut(Attribut attribut, int montant) {
        switch (attribut) {
            case INT -> intelligence += montant;
            case FOR -> force += montant;
            case VIT -> vitalite += montant;
            case PRE -> precision += montant;
            case CHA -> charisme += montant;
            case RES -> resistance += montant;
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

    /**
     * Un jour sans gain sur l'attribut (job de minuit, domain.md) : applique le
     * malus de base (−2, −3 pour PRE), incrémente le compteur de jours consécutifs
     * de manque, et déclenche en plus le malus cumulé de −5 pts exactement au 3e
     * jour consécutif (pas à chaque jour au-delà). Plancher 0 toujours respecté.
     */
    public MalusInactivite appliquerMalusInactivite(Attribut attribut) {
        int consecutifs = getJoursSansActivite(attribut) + 1;
        setJoursSansActivite(attribut, consecutifs);

        int malusBase = attribut == Attribut.PRE ? 3 : 2;
        appliquerVariation(attribut, -malusBase);

        boolean malusConsecutifDeclenche = consecutifs == 3;
        if (malusConsecutifDeclenche) {
            appliquerVariation(attribut, -5);
        }
        return new MalusInactivite(malusBase, malusConsecutifDeclenche);
    }

    /** Un jour avec gain sur l'attribut : la série de manque repart de zéro. */
    public void reinitialiserManque(Attribut attribut) {
        setJoursSansActivite(attribut, 0);
    }

    public int getJoursSansActivite(Attribut attribut) {
        return switch (attribut) {
            case INT -> joursSansActiviteIntelligence;
            case FOR -> joursSansActiviteForce;
            case VIT -> joursSansActiviteVitalite;
            case PRE -> joursSansActivitePrecision;
            case CHA -> joursSansActiviteCharisme;
            case RES -> joursSansActiviteResistance;
        };
    }

    private void setJoursSansActivite(Attribut attribut, int valeur) {
        switch (attribut) {
            case INT -> joursSansActiviteIntelligence = valeur;
            case FOR -> joursSansActiviteForce = valeur;
            case VIT -> joursSansActiviteVitalite = valeur;
            case PRE -> joursSansActivitePrecision = valeur;
            case CHA -> joursSansActiviteCharisme = valeur;
            case RES -> joursSansActiviteResistance = valeur;
        }
    }

    /** Variation bornée au plancher 0 (domain.md : "un attribut ne peut jamais devenir négatif"). */
    private void appliquerVariation(Attribut attribut, int delta) {
        int valeur = Math.max(0, getValeurAttribut(attribut) + delta);
        switch (attribut) {
            case INT -> intelligence = valeur;
            case FOR -> force = valeur;
            case VIT -> vitalite = valeur;
            case PRE -> precision = valeur;
            case CHA -> charisme = valeur;
            case RES -> resistance = valeur;
        }
    }

    /** Détail d'un malus d'inactivité appliqué, pour historisation par le service appelant. */
    public record MalusInactivite(int malusBase, boolean malusConsecutifDeclenche) {}

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
