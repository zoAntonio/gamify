package com.gamify.application.dtos.badge;

import com.gamify.domain.enums.Palier;

import java.time.LocalDateTime;

public record UserBadgeResponse(
        Long id,
        String badgeNom,
        Palier palier,
        String domaineNom,
        String saisonNom,
        LocalDateTime dateObtention
) {
}
