package com.gamify.application.dtos.activity;

import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.Frequence;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActivityRequest(
        @NotBlank(message = "Le nom de la tâche est obligatoire")
        String nom,

        @NotNull(message = "Le domaine est obligatoire")
        Long domaineId,

        @NotNull(message = "L'attribut ciblé est obligatoire")
        Attribut attributCible,

        @NotNull(message = "La fréquence est obligatoire")
        Frequence frequence,

        String objectif
) {
}
