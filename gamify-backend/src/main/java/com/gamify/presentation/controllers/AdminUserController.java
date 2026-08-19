package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.backoffice.AdminUserStatsResponse;
import com.gamify.application.dtos.backoffice.UserRankResponse;
import com.gamify.application.services.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@Tag(name = "Backoffice - Utilisateurs", description = "Stats et classement des utilisateurs")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/backoffice/users")
@RequiredArgsConstructor
public class AdminUserController {

    private static final Set<String> CRITERES_TRI_AUTORISES = Set.of("xpTotal", "niveau");

    private final AdminUserService adminUserService;

    @Operation(summary = "Classement des utilisateurs", description = "Liste paginée triée par XP total ou niveau (décroissant).")
    @GetMapping
    public ApiResponse<Page<UserRankResponse>> ranking(
            @Parameter(description = "Critère de tri : xpTotal ou niveau") @RequestParam(defaultValue = "xpTotal") String sortBy,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        String critere = CRITERES_TRI_AUTORISES.contains(sortBy) ? sortBy : "xpTotal";
        var pageableTrie = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, critere));
        return ApiResponse.success(adminUserService.ranking(pageableTrie), "Classement récupéré");
    }

    @Operation(summary = "Statistiques globales", description = "Nombre total d'utilisateurs.")
    @GetMapping("/stats")
    public ApiResponse<AdminUserStatsResponse> stats() {
        return ApiResponse.success(adminUserService.stats(), "Statistiques récupérées");
    }
}
