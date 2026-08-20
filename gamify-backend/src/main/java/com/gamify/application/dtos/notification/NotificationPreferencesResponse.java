package com.gamify.application.dtos.notification;

public record NotificationPreferencesResponse(
        boolean rappelActif,
        boolean finJourneeActif,
        boolean celebrationActif
) {
}
