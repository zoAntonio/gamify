package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.profile.CreateDomaineRequest;
import com.gamify.application.dtos.profile.DomaineResponse;
import com.gamify.application.services.DomaineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Domaines", description = "Gestion des domaines d'activité (maths, sport, langues...) de l'utilisateur")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/domaines")
@RequiredArgsConstructor
public class DomaineController {

    private final DomaineService domaineService;

    @Operation(summary = "Lister les domaines disponibles", description = "Retourne les domaines de l'utilisateur authentifié.")
    @GetMapping
    public ApiResponse<List<DomaineResponse>> listAvailable(Authentication authentication) {
        return ApiResponse.success(
                domaineService.listAvailable(authentication.getName()),
                "Domaines disponibles"
        );
    }

    @Operation(summary = "Créer un domaine", description = "Crée un nouveau domaine d'activité pour l'utilisateur authentifié.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DomaineResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateDomaineRequest request
    ) {
        return ApiResponse.success(
                domaineService.create(authentication.getName(), request),
                "Domaine créé"
        );
    }
}
