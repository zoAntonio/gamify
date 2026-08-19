package com.gamify.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Saison du système d'achievement (~3 mois, gérée manuellement par l'admin depuis
 * le backoffice). Les badges se regagnent à chaque saison : le compteur de
 * validations qui déclenche un déblocage est toujours recalculé dans la fenêtre
 * [dateDebut, dateFin] de la saison active — pas de reset physique d'un compteur.
 */
@Entity
@Table(name = "saisons")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Saison extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    private boolean cloturee = false;
}
