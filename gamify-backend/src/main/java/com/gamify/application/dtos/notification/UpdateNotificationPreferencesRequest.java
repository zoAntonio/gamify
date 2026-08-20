package com.gamify.application.dtos.notification;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferencesRequest(
        @NotNull Boolean rappelActif,
        @NotNull Boolean finJourneeActif,
        @NotNull Boolean celebrationActif
) {
}
