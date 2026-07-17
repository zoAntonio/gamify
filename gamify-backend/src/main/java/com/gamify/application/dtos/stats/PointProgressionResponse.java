package com.gamify.application.dtos.stats;

import java.time.LocalDate;

/** Un point du graphique de progression : un jour (semaine/mois) ou un mois (année). */
public record PointProgressionResponse(
        String label,
        LocalDate date,
        int gainsAttributs,
        int xpGagne
) {
}
