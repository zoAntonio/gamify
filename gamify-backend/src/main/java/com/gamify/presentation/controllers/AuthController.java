package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.auth.AuthResponse;
import com.gamify.application.dtos.auth.LoginRequest;
import com.gamify.application.dtos.auth.RegisterRequest;
import com.gamify.application.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentification", description = "Inscription, connexion et vérification de disponibilité de l'API")
@SecurityRequirements
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Créer un compte", description = "Enregistre un nouvel utilisateur et retourne son token JWT.")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "Compte créé");
    }

    @Operation(summary = "Se connecter", description = "Authentifie un utilisateur et retourne son token JWT.")
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Connexion réussie");
    }

    @Operation(summary = "Vérifier la disponibilité de l'API", description = "Endpoint de santé simple, sans authentification.")
    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("Gamify Backend OK", "Pong");
    }
}
