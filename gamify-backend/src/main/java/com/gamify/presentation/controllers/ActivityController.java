package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.activity.ActivityRequest;
import com.gamify.application.dtos.activity.ActivityResponse;
import com.gamify.application.dtos.activity.ActivityStatutRequest;
import com.gamify.application.services.ActivityService;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.StatutKanban;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Activités", description = "Gestion des tâches/activités (kanban) et de leur validation")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @Operation(summary = "Rechercher des activités", description = "Liste paginée des activités de l'utilisateur, filtrable par domaine, attribut cible et statut kanban.")
    @GetMapping
    public ApiResponse<Page<ActivityResponse>> search(
            Authentication authentication,
            @Parameter(description = "Identifiant du domaine à filtrer") @RequestParam(required = false) Long domaineId,
            @Parameter(description = "Attribut RPG ciblé par l'activité") @RequestParam(required = false) Attribut attributCible,
            @Parameter(description = "Statut kanban de l'activité") @RequestParam(required = false) StatutKanban statut,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(
                activityService.search(authentication.getName(), domaineId, attributCible, statut, pageable),
                "Tâches récupérées"
        );
    }

    @Operation(summary = "Créer une activité", description = "Crée une nouvelle activité/tâche pour l'utilisateur authentifié.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ActivityResponse> create(
            Authentication authentication,
            @Valid @RequestBody ActivityRequest request
    ) {
        return ApiResponse.success(
                activityService.create(authentication.getName(), request),
                "Tâche créée"
        );
    }

    @Operation(summary = "Changer le statut d'une activité", description = "Déplace une activité entre les colonnes du kanban (à faire, en cours, terminé...).")
    @PatchMapping("/{id}/statut")
    public ApiResponse<ActivityResponse> changerStatut(
            Authentication authentication,
            @Parameter(description = "Identifiant de l'activité") @PathVariable Long id,
            @Valid @RequestBody ActivityStatutRequest request
    ) {
        return ApiResponse.success(
                activityService.changerStatut(authentication.getName(), id, request.statut()),
                "Statut mis à jour"
        );
    }

    @Operation(summary = "Valider une activité", description = "Valide une activité terminée et attribue les points d'attribut correspondants.")
    @PostMapping("/{id}/valider")
    public ApiResponse<ActivityResponse> valider(
            Authentication authentication,
            @Parameter(description = "Identifiant de l'activité") @PathVariable Long id
    ) {
        return ApiResponse.success(
                activityService.valider(authentication.getName(), id),
                "Tâche validée"
        );
    }
}
