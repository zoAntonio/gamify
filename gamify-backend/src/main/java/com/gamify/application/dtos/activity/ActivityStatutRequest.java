package com.gamify.application.dtos.activity;

import com.gamify.domain.enums.StatutKanban;
import jakarta.validation.constraints.NotNull;

public record ActivityStatutRequest(
        @NotNull(message = "Le statut cible est obligatoire")
        StatutKanban statut
) {
}
