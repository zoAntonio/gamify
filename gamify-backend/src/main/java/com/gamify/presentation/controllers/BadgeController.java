package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.badge.BadgeLockedResponse;
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

@Tag(name = "Badges", description = "Galerie de badges du joueur : acquis (toutes saisons) et à débloquer (saison active)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @Operation(summary = "Mes badges", description = "Badges débloqués par l'utilisateur authentifié, toutes saisons confondues (le plus récent d'abord).")
    @GetMapping("/me")
    public ApiResponse<List<UserBadgeResponse>> mesBadges(Authentication authentication) {
        return ApiResponse.success(badgeService.mesBadges(authentication.getName()), "Badges récupérés");
    }

    @Operation(summary = "Badges à débloquer", description = "Catalogue actif pas encore débloqué par l'utilisateur pour la saison en cours, avec la progression actuelle vers chaque seuil (vide si aucune saison active).")
    @GetMapping("/a-debloquer")
    public ApiResponse<List<BadgeLockedResponse>> badgesADebloquer(Authentication authentication) {
        return ApiResponse.success(badgeService.badgesADebloquer(authentication.getName()), "Badges à débloquer récupérés");
    }
}
