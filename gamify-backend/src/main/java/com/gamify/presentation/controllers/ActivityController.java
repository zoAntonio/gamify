package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.activity.ActivityRequest;
import com.gamify.application.dtos.activity.ActivityResponse;
import com.gamify.application.dtos.activity.ActivityStatutRequest;
import com.gamify.application.services.ActivityService;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.StatutKanban;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ApiResponse<Page<ActivityResponse>> search(
            Authentication authentication,
            @RequestParam(required = false) Long domaineId,
            @RequestParam(required = false) Attribut attributCible,
            @RequestParam(required = false) StatutKanban statut,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(
                activityService.search(authentication.getName(), domaineId, attributCible, statut, pageable),
                "Tâches récupérées"
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ActivityResponse> create(
            Authentication authentication,
            @Valid @RequestBody ActivityRequest request
    ) {
        return ApiResponse.success(
                activityService.create(authentication.getName(), request),
                "Tâche créée"
        );
    }

    @PatchMapping("/{id}/statut")
    public ApiResponse<ActivityResponse> changerStatut(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ActivityStatutRequest request
    ) {
        return ApiResponse.success(
                activityService.changerStatut(authentication.getName(), id, request.statut()),
                "Statut mis à jour"
        );
    }

    @PostMapping("/{id}/valider")
    public ApiResponse<ActivityResponse> valider(Authentication authentication, @PathVariable Long id) {
        return ApiResponse.success(
                activityService.valider(authentication.getName(), id),
                "Tâche validée"
        );
    }
}
