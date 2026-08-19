package com.gamify.domain.entities;

import com.gamify.domain.enums.Palier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Catalogue admin-géré des badges (Bronze/Argent/Or par domaine, domain.md) —
 * les déblocages effectifs par utilisateur/saison sont dans {@link UserBadge}.
 */
@Entity
@Table(name = "badge_definitions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class BadgeDefinition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domaine_id", nullable = false)
    private Domaine domaine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Palier palier;

    @Column(nullable = false)
    private String nom;

    private String description;

    @Column(name = "seuil_validations", nullable = false)
    private int seuilValidations;

    // Désactivation logique depuis le backoffice (jamais de suppression physique :
    // des UserBadge peuvent déjà référencer ce badge).
    private boolean actif = true;

    /** Le badge est-il débloqué pour un nombre de validations donné dans la saison en cours ? */
    public boolean estAtteint(long nbValidationsDansLaSaison) {
        return nbValidationsDansLaSaison >= seuilValidations;
    }
}
