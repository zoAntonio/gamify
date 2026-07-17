package com.gamify.application.dtos.habit;

import com.gamify.domain.enums.Attribut;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record HabitRequest(
        @NotBlank(message = "Le nom de l'habitude est obligatoire")
        String nom,

        @NotNull(message = "Le domaine est obligatoire")
        Long domaineId,

        @NotNull(message = "L'attribut ciblé est obligatoire")
        Attribut attributCible,

        @Size(max = 16, message = "L'icône est limitée à 16 caractères")
        String icone,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "La couleur doit être un code hex (#rrggbb)")
        String couleur
) {
}
