package com.gamify.presentation.controllers;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.application.dtos.auth.AuthResponse;
import com.gamify.application.dtos.auth.LoginRequest;
import com.gamify.application.dtos.auth.RegisterRequest;
import com.gamify.application.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "Compte créé");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Connexion réussie");
    }

    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("Gamify Backend OK", "Pong");
    }
}
