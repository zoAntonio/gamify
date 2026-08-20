package com.gamify.application.dtos.agenda;

import com.gamify.domain.enums.Frequence;
import com.gamify.domain.enums.StatutKanban;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AgendaEventResponse(
        Long id,
        String titre,
        LocalDateTime dateDebut,
        LocalDateTime dateFin,
        Long activityId,
        String activityNom,
        StatutKanban activityStatut, // null si événement libre — sert au code couleur vert/rouge
        Long serieId, // null si événement non récurrent
        Frequence frequenceRecurrence, // null si non récurrent
        List<DayOfWeek> joursSemaine, // pertinent seulement si HEBDOMADAIRE
        LocalDate finRecurrence, // null si non récurrent
        boolean detachee // true si occurrence détachée de sa série (éditée individuellement)
) {
}
