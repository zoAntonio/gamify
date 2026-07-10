package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.profile.ProfileResponse;
import com.gamify.application.dtos.profile.UpdateProfileRequest;
import com.gamify.application.services.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ApiResponse<ProfileResponse> getProfile(Authentication authentication) {
        return ApiResponse.success(profileService.getProfile(authentication.getName()), "Profil récupéré");
    }

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
