package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.agenda.AgendaEventRequest;
import com.gamify.application.dtos.agenda.AgendaEventResponse;
import com.gamify.application.dtos.agenda.AgendaSeriesUpdateRequest;
import com.gamify.application.services.AgendaService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Tag(name = "Agenda", description = "Événements d'agenda (vues semaine/jour/mois), liables à une tâche kanban")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/agenda")
@RequiredArgsConstructor
public class AgendaController {

    private final AgendaService agendaService;

    @Operation(summary = "Lister les événements", description = "Liste paginée des événements de l'utilisateur dont le début est dans [from, to].")
    @GetMapping
    public ApiResponse<Page<AgendaEventResponse>> list(
            Authentication authentication,
            @Parameter(description = "Borne de début (ISO-8601)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @Parameter(description = "Borne de fin (ISO-8601)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 100) Pageable pageable
    ) {
        return ApiResponse.success(
                agendaService.list(authentication.getName(), from, to, pageable),
                "Événements récupérés"
        );
    }

    @Operation(summary = "Créer un événement", description = "Crée un événement libre, ou lié à une tâche via activityId.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AgendaEventResponse> create(
            Authentication authentication,
            @Valid @RequestBody AgendaEventRequest request
    ) {
        return ApiResponse.success(
                agendaService.create(authentication.getName(), request),
                "Événement créé"
        );
    }

    @Operation(summary = "Modifier un événement", description = "Modifie titre, créneau ou tâche liée — sert aussi au déplacement dans le calendrier.")
    @PutMapping("/{id}")
    public ApiResponse<AgendaEventResponse> update(
            Authentication authentication,
            @Parameter(description = "Identifiant de l'événement") @PathVariable Long id,
            @Valid @RequestBody AgendaEventRequest request
    ) {
        return ApiResponse.success(
                agendaService.update(authentication.getName(), id, request),
                "Événement modifié"
        );
    }

    @Operation(summary = "Supprimer un événement", description = "Supprime définitivement l'événement.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            Authentication authentication,
            @Parameter(description = "Identifiant de l'événement") @PathVariable Long id
    ) {
        agendaService.delete(authentication.getName(), id);
        return ApiResponse.success(null, "Événement supprimé");
    }

    @Operation(summary = "Modifier toute la série", description = "Modifie titre/heures/tâche liée et la règle de récurrence pour toutes les occurrences non détachées de la série (id de n'importe quelle occurrence de la série).")
    @PutMapping("/{id}/serie")
    public ApiResponse<Void> updateSeries(
            Authentication authentication,
            @Parameter(description = "Identifiant d'une occurrence de la série") @PathVariable Long id,
            @Valid @RequestBody AgendaSeriesUpdateRequest request
    ) {
        agendaService.updateSeries(authentication.getName(), id, request);
        return ApiResponse.success(null, "Série modifiée");
    }

    @Operation(summary = "Supprimer toute la série", description = "Supprime définitivement toutes les occurrences de la série, y compris celles détachées.")
    @DeleteMapping("/{id}/serie")
    public ApiResponse<Void> deleteSeries(
            Authentication authentication,
            @Parameter(description = "Identifiant d'une occurrence de la série") @PathVariable Long id
    ) {
        agendaService.deleteSeries(authentication.getName(), id);
        return ApiResponse.success(null, "Série supprimée");
    }
}
