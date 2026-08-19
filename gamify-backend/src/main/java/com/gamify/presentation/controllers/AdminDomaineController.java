package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.backoffice.AdminDomaineResponse;
import com.gamify.application.dtos.profile.CreateDomaineRequest;
import com.gamify.application.services.AdminDomaineService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Backoffice - Domaines", description = "CRUD admin sur tous les domaines (système et personnels)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/backoffice/domaines")
@RequiredArgsConstructor
public class AdminDomaineController {

    private final AdminDomaineService adminDomaineService;

    @Operation(summary = "Lister tous les domaines", description = "Domaines système et personnels, actifs et inactifs, paginés.")
    @GetMapping
    public ApiResponse<Page<AdminDomaineResponse>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(adminDomaineService.list(pageable), "Domaines récupérés");
    }

    @Operation(summary = "Créer un domaine système", description = "Crée un nouveau domaine global (non rattaché à un utilisateur).")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminDomaineResponse> create(@Valid @RequestBody CreateDomaineRequest request) {
        return ApiResponse.success(adminDomaineService.create(request), "Domaine créé");
    }

    @Operation(summary = "Modifier un domaine", description = "Modifie le nom/les attributs de n'importe quel domaine (système ou personnel).")
    @PutMapping("/{id}")
    public ApiResponse<AdminDomaineResponse> update(
            @Parameter(description = "Identifiant du domaine") @PathVariable Long id,
            @Valid @RequestBody CreateDomaineRequest request
    ) {
        return ApiResponse.success(adminDomaineService.update(id, request), "Domaine modifié");
    }

    @Operation(summary = "Désactiver un domaine", description = "Désactivation logique : n'est plus proposable, l'historique existant reste intact.")
    @DeleteMapping("/{id}")
    public ApiResponse<AdminDomaineResponse> deactivate(
            @Parameter(description = "Identifiant du domaine") @PathVariable Long id
    ) {
        return ApiResponse.success(adminDomaineService.deactivate(id), "Domaine désactivé");
    }
}
