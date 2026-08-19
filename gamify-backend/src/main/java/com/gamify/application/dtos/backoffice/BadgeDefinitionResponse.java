package com.gamify.application.dtos.backoffice;

import com.gamify.domain.enums.Palier;

public record BadgeDefinitionResponse(
        Long id,
        Long domaineId,
        String domaineNom,
        Palier palier,
        String nom,
        String description,
        int seuilValidations,
        boolean actif
) {
}
