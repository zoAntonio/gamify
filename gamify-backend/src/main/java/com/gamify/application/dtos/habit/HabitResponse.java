package com.gamify.application.dtos.habit;

import com.gamify.domain.enums.Attribut;

import java.time.LocalDate;
import java.util.List;

public record HabitResponse(
        Long id,
        String nom,
        Long domaineId,
        String domaineNom,
        Attribut attributCible,
        String icone,
        String couleur,
        int xpRecompense,
        int streakCourant,
        int meilleurStreak,
        boolean faitAujourdhui,
        List<LocalDate> completions // 84 derniers jours — de quoi dessiner la grille 12 semaines
) {
}
