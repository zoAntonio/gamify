package com.gamify.presentation.advice;

import com.gamify.application.dtos.ApiResponse;
import com.gamify.domain.exceptions.ConflictException;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.ForbiddenException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.domain.exceptions.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleNotFound(NotFoundException ex, HttpServletRequest request) {
        logBusinessError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<Void> handleConflict(ConflictException ex, HttpServletRequest request) {
        logBusinessError(HttpStatus.CONFLICT, ex.getMessage(), request);
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        logBusinessError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleForbidden(ForbiddenException ex, HttpServletRequest request) {
        logBusinessError(HttpStatus.FORBIDDEN, ex.getMessage(), request);
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(DomainException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleDomain(DomainException ex, HttpServletRequest request) {
        logBusinessError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        logBusinessError(HttpStatus.BAD_REQUEST, message, request);
        return ApiResponse.error(message);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("500 {} {} : erreur non gérée", request.getMethod(), request.getRequestURI(), ex);
        return ApiResponse.error("Une erreur inattendue est survenue");
    }

    // Erreurs métier attendues (400/401/403/404/409) : WARN avec contexte, sans
    // stacktrace — ce ne sont pas des bugs, mais il faut pouvoir les repérer
    // dans le terminal pour suivre ce qui clenche côté utilisateur.
    private void logBusinessError(HttpStatus status, String message, HttpServletRequest request) {
        log.warn("{} {} {} : {}", status.value(), request.getMethod(), request.getRequestURI(), message);
    }
}
