package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.backoffice.CreateSaisonRequest;
import com.gamify.application.dtos.backoffice.SaisonResponse;
import com.gamify.application.services.SaisonService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Backoffice - Saisons", description = "Gestion des saisons du système d'achievement")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/backoffice/saisons")
@RequiredArgsConstructor
public class SaisonController {

    private final SaisonService saisonService;

    @Operation(summary = "Lister les saisons", description = "Historique des saisons, paginé.")
    @GetMapping
    public ApiResponse<Page<SaisonResponse>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(saisonService.list(pageable), "Saisons récupérées");
    }

    @Operation(summary = "Créer une saison", description = "Ouvre une nouvelle saison (~3 mois). Refusé si une saison est déjà active.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SaisonResponse> create(@Valid @RequestBody CreateSaisonRequest request) {
        return ApiResponse.success(saisonService.create(request), "Saison créée");
    }

    @Operation(summary = "Clôturer une saison", description = "Clôture la saison active ; les badges obtenus restent historisés.")
    @PostMapping("/{id}/cloturer")
    public ApiResponse<SaisonResponse> cloturer(
            @Parameter(description = "Identifiant de la saison") @PathVariable Long id
    ) {
        return ApiResponse.success(saisonService.cloturer(id), "Saison clôturée");
    }
}
