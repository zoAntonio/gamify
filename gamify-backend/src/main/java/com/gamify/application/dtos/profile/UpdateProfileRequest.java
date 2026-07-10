package com.gamify.application.dtos.profile;

import com.gamify.domain.enums.Avatar;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateProfileRequest(
        @NotNull(message = "L'avatar est obligatoire")
        Avatar avatar,

        @NotEmpty(message = "Sélectionne au moins un domaine à suivre")
        List<Long> domaineIds
) {
}
