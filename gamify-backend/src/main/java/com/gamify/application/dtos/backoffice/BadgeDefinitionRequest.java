package com.gamify.application.dtos.backoffice;

import com.gamify.domain.enums.Palier;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BadgeDefinitionRequest(
        @NotNull(message = "Le domaine est obligatoire")
        Long domaineId,

        @NotNull(message = "Le palier est obligatoire")
        Palier palier,

        @NotBlank(message = "Le nom du badge est obligatoire")
        String nom,

        String description,

        @Positive(message = "Le seuil de validations doit être positif")
        int seuilValidations
) {
}
