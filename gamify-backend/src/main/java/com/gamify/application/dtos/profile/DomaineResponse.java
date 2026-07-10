package com.gamify.application.dtos.profile;

import com.gamify.domain.enums.Attribut;

import java.util.Set;

public record DomaineResponse(
        Long id,
        String nom,
        Set<Attribut> attributs,
        boolean systeme
) {
}
