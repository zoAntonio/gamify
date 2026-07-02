package com.gamify.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String username;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 6)
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String email;
        private int niveau;
        private int xpTotal;

        public AuthResponse(String token, String username, String email, int niveau, int xpTotal) {
            this.token = token;
            this.username = username;
            this.email = email;
            this.niveau = niveau;
            this.xpTotal = xpTotal;
        }
    }
}
