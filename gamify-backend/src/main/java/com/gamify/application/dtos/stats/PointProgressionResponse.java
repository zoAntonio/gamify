package com.gamify.application.dtos.stats;

import java.time.LocalDate;

/**
 * Un point du graphique de progression : un jour (semaine/mois) ou un mois (année).
 * {@code pertesAttributs} (G1-T06, valeur absolue) vient des malus d'inactivité
 * (G1-T04) — {@code xpGagne} ne peut jamais être négatif, l'XP n'étant jamais
 * touchée par un malus (voir {@code InactivityPenaltyService}).
 */
public record PointProgressionResponse(
        String label,
        LocalDate date,
        int gainsAttributs,
        int pertesAttributs,
        int xpGagne
) {
}
