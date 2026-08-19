package com.gamify.application.dtos.backoffice;

import java.time.LocalDate;

public record SaisonResponse(
        Long id,
        String nom,
        LocalDate dateDebut,
        LocalDate dateFin,
        boolean cloturee
) {
}
