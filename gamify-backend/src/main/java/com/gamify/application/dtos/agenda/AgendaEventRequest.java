package com.gamify.application.dtos.agenda;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AgendaEventRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String titre,

        @NotNull(message = "La date de début est obligatoire")
        LocalDateTime dateDebut,

        @NotNull(message = "La date de fin est obligatoire")
        LocalDateTime dateFin,

        Long activityId
) {
}
