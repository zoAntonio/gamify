package com.gamify.application.dtos.social;

import jakarta.validation.constraints.NotNull;

public record UpdatePrivacyPreferencesRequest(@NotNull Boolean profilPublic) {
}
