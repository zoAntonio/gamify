package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.backoffice.BadgeDefinitionRequest;
import com.gamify.application.dtos.backoffice.BadgeDefinitionResponse;
import com.gamify.application.services.BadgeDefinitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Backoffice - Badges", description = "CRUD admin du catalogue de badges (Bronze/Argent/Or par domaine)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/backoffice/badges")
@RequiredArgsConstructor
public class BadgeDefinitionController {

    private final BadgeDefinitionService badgeDefinitionService;

    @Operation(summary = "Lister les badges", description = "Catalogue des badges, filtrable par domaine, paginé.")
    @GetMapping
    public ApiResponse<Page<BadgeDefinitionResponse>> list(
            @Parameter(description = "Identifiant du domaine à filtrer") @RequestParam(required = false) Long domaineId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(badgeDefinitionService.list(domaineId, pageable), "Badges récupérés");
    }

    @Operation(summary = "Créer un badge", description = "Ajoute un badge (palier + seuil de validations) au catalogue d'un domaine.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BadgeDefinitionResponse> create(@Valid @RequestBody BadgeDefinitionRequest request) {
        return ApiResponse.success(badgeDefinitionService.create(request), "Badge créé");
    }

    @Operation(summary = "Modifier un badge", description = "Modifie le domaine/palier/nom/description/seuil d'un badge.")
    @PutMapping("/{id}")
    public ApiResponse<BadgeDefinitionResponse> update(
            @Parameter(description = "Identifiant du badge") @PathVariable Long id,
            @Valid @RequestBody BadgeDefinitionRequest request
    ) {
        return ApiResponse.success(badgeDefinitionService.update(id, request), "Badge modifié");
    }

    @Operation(summary = "Désactiver un badge", description = "Désactivation logique : n'est plus débloquable, l'historique des obtentions reste intact.")
    @DeleteMapping("/{id}")
    public ApiResponse<BadgeDefinitionResponse> deactivate(
            @Parameter(description = "Identifiant du badge") @PathVariable Long id
    ) {
        return ApiResponse.success(badgeDefinitionService.deactivate(id), "Badge désactivé");
    }
}
