package com.gamify.application.dtos.agenda;

import com.gamify.domain.enums.StatutKanban;

import java.time.LocalDateTime;

public record AgendaEventResponse(
        Long id,
        String titre,
        LocalDateTime dateDebut,
        LocalDateTime dateFin,
        Long activityId,
        String activityNom,
        StatutKanban activityStatut // null si événement libre — sert au code couleur vert/rouge
) {
}
