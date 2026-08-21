package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.social.PrivacyPreferencesResponse;
import com.gamify.application.dtos.social.UpdatePrivacyPreferencesRequest;
import com.gamify.application.services.PrivacyPreferencesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Confidentialité", description = "Réglage de visibilité du profil (opt-in classement/fil d'activité social)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/privacy-preferences")
@RequiredArgsConstructor
public class PrivacyPreferencesController {

    private final PrivacyPreferencesService privacyPreferencesService;

    @Operation(summary = "Lire le réglage", description = "Indique si le profil de l'utilisateur authentifié est public.")
    @GetMapping
    public ApiResponse<PrivacyPreferencesResponse> get(Authentication authentication) {
        return ApiResponse.success(
                privacyPreferencesService.getPreferences(authentication.getName()),
                "Réglage récupéré"
        );
    }

    @Operation(summary = "Mettre à jour le réglage", description = "Active/désactive la visibilité publique du profil (classement, fil d'activité).")
    @PutMapping
    public ApiResponse<PrivacyPreferencesResponse> update(
            Authentication authentication,
            @Valid @RequestBody UpdatePrivacyPreferencesRequest request
    ) {
        return ApiResponse.success(
                privacyPreferencesService.updatePreferences(authentication.getName(), request),
                "Réglage mis à jour"
        );
    }
}
