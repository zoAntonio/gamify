package com.gamify.domain.exceptions;

public class ForbiddenException extends DomainException {
    public ForbiddenException(String message) {
        super(message);
    }
}
