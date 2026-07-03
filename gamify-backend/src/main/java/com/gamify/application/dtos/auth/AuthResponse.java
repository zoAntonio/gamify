package com.gamify.application.dtos.auth;

public record AuthResponse(
        String token,
        String username,
        String email,
        int niveau,
        int xpTotal
) {
}
