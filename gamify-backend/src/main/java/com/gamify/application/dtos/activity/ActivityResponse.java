package com.gamify.application.dtos.activity;

import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.Frequence;
import com.gamify.domain.enums.StatutKanban;

import java.time.LocalDateTime;

public record ActivityResponse(
        Long id,
        String nom,
        Long domaineId,
        String domaineNom,
        Attribut attributCible,
        Frequence frequence,
        String objectif,
        int xpRecompense,
        StatutKanban statut,
        LocalDateTime completedAt,
        String photoUrl
) {
}
