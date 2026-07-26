package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.habit.HabitRequest;
import com.gamify.application.dtos.habit.HabitResponse;
import com.gamify.application.services.HabitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Habitudes", description = "Tracker d'habitudes : check quotidien, streaks et grille de contributions")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @Operation(summary = "Lister les habitudes", description = "Liste paginée des habitudes de l'utilisateur, avec streak courant, record et completions des 12 dernières semaines.")
    @GetMapping
    public ApiResponse<Page<HabitResponse>> list(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(
                habitService.list(authentication.getName(), pageable),
                "Habitudes récupérées"
        );
    }

    @Operation(summary = "Créer une habitude", description = "Crée une habitude liée à un domaine et un attribut RPG.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<HabitResponse> create(
            Authentication authentication,
            @Valid @RequestBody HabitRequest request
    ) {
        return ApiResponse.success(
                habitService.create(authentication.getName(), request),
                "Habitude créée"
        );
    }

    @Operation(summary = "Cocher l'habitude aujourd'hui", description = "Marque l'habitude comme faite aujourd'hui : +1 attribut ciblé, +XP, bonus +10 XP tous les 7 jours de série. Refusé si déjà cochée aujourd'hui.")
    @PostMapping("/{id}/check")
    public ApiResponse<HabitResponse> check(
            Authentication authentication,
            @Parameter(description = "Identifiant de l'habitude") @PathVariable Long id
    ) {
        return ApiResponse.success(
                habitService.check(authentication.getName(), id),
                "Habitude cochée"
        );
    }

    @Operation(summary = "Annuler une complétion", description = "Annule (logiquement) la complétion d'une date donnée : reprend l'XP/attribut gagnés et recalcule honnêtement le record de série.")
    @DeleteMapping("/{id}/completions/{date}")
    public ApiResponse<HabitResponse> cancel(
            Authentication authentication,
            @Parameter(description = "Identifiant de l'habitude") @PathVariable Long id,
            @Parameter(description = "Date de la complétion à annuler (ISO-8601)")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.success(
                habitService.annuler(authentication.getName(), id, date),
                "Complétion annulée"
        );
    }
}
