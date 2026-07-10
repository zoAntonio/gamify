package com.gamify.presentation.middleware;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamify.application.dtos.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Sans ce point d'entrée custom, Spring Security renvoie 403 (pas 401) quand
 * aucun token n'est fourni : l'AnonymousAuthenticationFilter peuple un
 * principal "anonyme", donc l'échec est traité comme "authentifié mais non
 * autorisé" plutôt que "non authentifié".
 */
@Component
@RequiredArgsConstructor
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                objectMapper.writeValueAsString(ApiResponse.error("Authentification requise"))
        );
    }
}
