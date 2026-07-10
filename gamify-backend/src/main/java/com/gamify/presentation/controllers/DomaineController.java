package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.profile.CreateDomaineRequest;
import com.gamify.application.dtos.profile.DomaineResponse;
import com.gamify.application.services.DomaineService;
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

@RestController
@RequestMapping("/api/domaines")
@RequiredArgsConstructor
public class DomaineController {

    private final DomaineService domaineService;

    @GetMapping
    public ApiResponse<List<DomaineResponse>> listAvailable(Authentication authentication) {
        return ApiResponse.success(
                domaineService.listAvailable(authentication.getName()),
                "Domaines disponibles"
        );
    }

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
