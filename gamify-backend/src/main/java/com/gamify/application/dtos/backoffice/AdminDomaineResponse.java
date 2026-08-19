package com.gamify.application.dtos.backoffice;

import com.gamify.domain.enums.Attribut;

import java.util.Set;

public record AdminDomaineResponse(
        Long id,
        String nom,
        Set<Attribut> attributs,
        boolean systeme,
        String proprietaire,
        boolean actif
) {
}
