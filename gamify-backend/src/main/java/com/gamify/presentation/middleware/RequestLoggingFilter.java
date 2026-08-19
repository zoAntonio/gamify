package com.gamify.presentation.middleware;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Trace chaque requête HTTP entrante dans le terminal backend (méthode, URI,
 * statut, durée) pour pouvoir suivre ce qui se passe/clenche en dev.
 * <p>
 * Ordonné en {@code HIGHEST_PRECEDENCE} pour envelopper aussi la chaîne Spring
 * Security : un 401/403 généré par {@code JsonAuthenticationEntryPoint}/
 * {@code JsonAccessDeniedHandler} avant d'atteindre un controller doit rester
 * visible, sinon ces rejets d'authentification passeraient inaperçus.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        // Fichiers statiques (avatars) : bruit sans intérêt diagnostique, exclus.
        return request.getRequestURI().startsWith("/uploads/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            logRequest(request, response, System.currentTimeMillis() - start);
        }
    }

    private void logRequest(HttpServletRequest request, HttpServletResponse response, long durationMs) {
        int status = response.getStatus();
        String method = request.getMethod();
        String uri = request.getRequestURI();

        if (status >= 500) {
            log.error("{} {} → {} ({} ms)", method, uri, status, durationMs);
        } else if (status >= 400) {
            log.warn("{} {} → {} ({} ms)", method, uri, status, durationMs);
        } else {
            log.info("{} {} → {} ({} ms)", method, uri, status, durationMs);
        }
    }
}
