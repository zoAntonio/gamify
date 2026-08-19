package com.gamify.application.dtos.backoffice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateSaisonRequest(
        @NotBlank(message = "Le nom de la saison est obligatoire")
        String nom,

        @NotNull(message = "La date de début est obligatoire")
        LocalDate dateDebut,

        @NotNull(message = "La date de fin est obligatoire")
        LocalDate dateFin
) {
}
