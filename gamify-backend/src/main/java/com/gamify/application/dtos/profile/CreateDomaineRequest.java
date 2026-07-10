package com.gamify.application.dtos.profile;

import com.gamify.domain.enums.Attribut;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record CreateDomaineRequest(
        @NotBlank(message = "Le nom du domaine est obligatoire")
        String nom,

        @NotEmpty(message = "Le domaine doit être lié à au moins un attribut")
        Set<Attribut> attributs
) {
}
