package com.gamify.application.dtos.social;

import java.time.LocalDateTime;

/**
 * Une entrée du fil d'activité social (G2-T17) : un gain d'attribut (activité
 * validée ou habitude cochée) d'un utilisateur au profil public. Ne reflète que
 * ce que {@link com.gamify.domain.entities.ProgressionLog} porte déjà — aucune
 * donnée sensible (pas d'email, pas d'id interne autre que ce qui sert d'affichage).
 */
public record ActivityFeedEntryResponse(
        String username,
        String source,
        String attribut,
        int delta,
        LocalDateTime date
) {
}
