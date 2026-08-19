package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.services.InactivityPenaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Déclenchement manuel du job de pénalités d'inactivité (normalement exécuté à
 * minuit par {@code InactivityPenaltyScheduler}) : sert au rattrapage si le
 * serveur était arrêté à minuit, et à la vérification manuelle (curl) du volet
 * malus de G1-T04. Idempotent par profil (voir InactivityPenaltyService) : rejouer
 * la même date ne double jamais un malus déjà appliqué.
 */
@Tag(name = "Backoffice - Pénalités", description = "Déclenchement manuel du job de pénalités d'inactivité")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/backoffice/penalites")
@RequiredArgsConstructor
public class AdminInactivityController {

    private final InactivityPenaltyService inactivityPenaltyService;

    @Operation(summary = "Exécuter le job de pénalités d'inactivité",
            description = "Évalue/rattrape les malus d'inactivité jusqu'à la date donnée incluse (hier par défaut).")
    @PostMapping("/executer")
    public ApiResponse<Void> executer(
            @Parameter(description = "Dernière date à évaluer (incluse), ISO-8601 — défaut : hier")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate dateLimite = date != null ? date : LocalDate.now().minusDays(1);
        inactivityPenaltyService.appliquerPenalitesJusqua(dateLimite);
        return ApiResponse.success(null, "Pénalités d'inactivité appliquées jusqu'au " + dateLimite);
    }
}
