package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.stats.PointProgressionResponse;
import com.gamify.application.dtos.stats.ProgressionLogResponse;
import com.gamify.application.services.StatsService;
import com.gamify.domain.enums.PeriodeStats;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Statistiques", description = "Progression dans le temps et journal des gains (alimentés par ProgressionLog)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @Operation(summary = "Progression agrégée", description = "Points de progression : 7 points-jour (SEMAINE), 30 points-jour (MOIS) ou 12 points-mois (ANNEE), zéros compris.")
    @GetMapping("/progression")
    public ApiResponse<List<PointProgressionResponse>> progression(
            Authentication authentication,
            @Parameter(description = "Période d'agrégation") @RequestParam PeriodeStats periode
    ) {
        return ApiResponse.success(
                statsService.progression(authentication.getName(), periode),
                "Progression récupérée"
        );
    }

    @Operation(summary = "Journal du jour", description = "Liste paginée des gains du jour (attribut, source, XP), du plus récent au plus ancien.")
    @GetMapping("/journal")
    public ApiResponse<Page<ProgressionLogResponse>> journal(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(
                statsService.journalDuJour(authentication.getName(), pageable),
                "Journal récupéré"
        );
    }
}
