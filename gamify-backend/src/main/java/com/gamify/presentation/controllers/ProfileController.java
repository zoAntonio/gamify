package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.profile.ProfileResponse;
import com.gamify.application.dtos.profile.UpdateProfileRequest;
import com.gamify.application.services.ProfileService;
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

@Tag(name = "Profil", description = "Consultation et mise à jour du profil de l'utilisateur connecté")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Récupérer le profil", description = "Retourne le profil (niveau, attributs, points) de l'utilisateur authentifié.")
    @GetMapping
    public ApiResponse<ProfileResponse> getProfile(Authentication authentication) {
        return ApiResponse.success(profileService.getProfile(authentication.getName()), "Profil récupéré");
    }

    @Operation(summary = "Mettre à jour le profil", description = "Met à jour les informations modifiables du profil de l'utilisateur authentifié.")
    @PutMapping
    public ApiResponse<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.success(
                profileService.updateProfile(authentication.getName(), request),
                "Profil mis à jour"
        );
    }
}
