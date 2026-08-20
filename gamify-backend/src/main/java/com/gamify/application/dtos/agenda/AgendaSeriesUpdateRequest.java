package com.gamify.application.dtos.agenda;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

// Édition "toute la série" : pas de champ date — une édition de série ne
// déplace jamais les occurrences déjà passées, elle change à quelle heure /
// avec quel titre / selon quel motif la série se répète (voir AgendaService).
public record AgendaSeriesUpdateRequest(
        @NotBlank(message = "Le titre est obligatoire")
        String titre,

        @NotNull(message = "L'heure de début est obligatoire")
        LocalTime heureDebut,

        @NotNull(message = "L'heure de fin est obligatoire")
        LocalTime heureFin,

        Long activityId,

        @NotNull(message = "La règle de récurrence est obligatoire")
        @Valid
        RecurrenceRequest recurrence
) {
}
