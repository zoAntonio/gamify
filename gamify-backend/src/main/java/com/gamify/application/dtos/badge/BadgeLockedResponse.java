package com.gamify.application.dtos.badge;

import com.gamify.domain.enums.Palier;

/**
 * Badge du catalogue pas encore débloqué cette saison par l'utilisateur — galerie
 * "à débloquer" (grisée, condition affichée, G2-T15). {@code progressionActuelle} est
 * le nombre de validations déjà comptabilisées dans le domaine du badge pour la saison
 * active (même règle que {@link com.gamify.application.services.BadgeService#evaluateAndUnlock}),
 * à comparer à {@code seuilValidations}.
 */
public record BadgeLockedResponse(
        Long id,
        String nom,
        String description,
        Palier palier,
        String domaineNom,
        int seuilValidations,
        long progressionActuelle
) {
}
