package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.badge.UserBadgeResponse;
import com.gamify.application.services.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Badges", description = "Badges obtenus par l'utilisateur pour la saison en cours")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @Operation(summary = "Mes badges", description = "Badges débloqués par l'utilisateur authentifié pour la saison active (vide si aucune saison en cours).")
    @GetMapping("/me")
    public ApiResponse<List<UserBadgeResponse>> mesBadges(Authentication authentication) {
        return ApiResponse.success(badgeService.mesBadges(authentication.getName()), "Badges récupérés");
    }
}
