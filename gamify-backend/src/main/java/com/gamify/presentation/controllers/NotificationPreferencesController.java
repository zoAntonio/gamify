package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.notification.NotificationPreferencesResponse;
import com.gamify.application.dtos.notification.UpdateNotificationPreferencesRequest;
import com.gamify.application.services.NotificationPreferencesService;
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

@Tag(name = "Notifications", description = "Réglages des catégories de notification de l'utilisateur (rappel, alerte fin de journée, célébration)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferencesController {

    private final NotificationPreferencesService notificationPreferencesService;

    @Operation(summary = "Lire les préférences", description = "Retourne l'état des 3 catégories de notification pour l'utilisateur authentifié.")
    @GetMapping
    public ApiResponse<NotificationPreferencesResponse> get(Authentication authentication) {
        return ApiResponse.success(
                notificationPreferencesService.getPreferences(authentication.getName()),
                "Préférences récupérées"
        );
    }

    @Operation(summary = "Mettre à jour les préférences", description = "Active/désactive individuellement chaque catégorie de notification.")
    @PutMapping
    public ApiResponse<NotificationPreferencesResponse> update(
            Authentication authentication,
            @Valid @RequestBody UpdateNotificationPreferencesRequest request
    ) {
        return ApiResponse.success(
                notificationPreferencesService.updatePreferences(authentication.getName(), request),
                "Préférences mises à jour"
        );
    }
}
