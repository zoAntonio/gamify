package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.social.ActivityFeedEntryResponse;
import com.gamify.application.dtos.social.RankResponse;
import com.gamify.application.services.SocialService;
import com.gamify.domain.enums.Attribut;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dimension sociale (G2-T17) : ouvert à tout utilisateur authentifié (pas
 * {@code hasRole("ADMIN")}, contrairement à {@code /api/backoffice/users} qui, lui,
 * voit tout le monde) — cohérent avec {@code SecurityConfig.anyRequest().authenticated()}.
 * Ne renvoie que des profils opt-in (voir {@code SocialService}).
 */
@Tag(name = "Social", description = "Classement et fil d'activité entre utilisateurs au profil public")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    @Operation(summary = "Classement", description = "Classement paginé des profils publics, trié par XP total/niveau, ou par un attribut si précisé.")
    @GetMapping("/classement")
    public ApiResponse<Page<RankResponse>> classement(
            @Parameter(description = "Critère de tri du classement général : xpTotal ou niveau (ignoré si attribut est fourni)")
            @RequestParam(defaultValue = "xpTotal") String sortBy,
            @Parameter(description = "Restreint le classement à cet attribut (tri sur sa seule valeur)")
            @RequestParam(required = false) Attribut attribut,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(socialService.classement(sortBy, attribut, pageable), "Classement récupéré");
    }

    @Operation(summary = "Fil d'activité", description = "Actions récentes (gains d'attribut) des utilisateurs au profil public, plus récentes d'abord.")
    @GetMapping("/fil-activite")
    public ApiResponse<Page<ActivityFeedEntryResponse>> filActivite(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(socialService.filActivite(pageable), "Fil d'activité récupéré");
    }
}
