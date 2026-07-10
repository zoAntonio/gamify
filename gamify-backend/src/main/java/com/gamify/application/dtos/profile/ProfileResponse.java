package com.gamify.application.dtos.profile;

import com.gamify.domain.enums.Avatar;

import java.util.List;

public record ProfileResponse(
        String username,
        String email,
        Avatar avatar,
        List<DomaineResponse> domainesTrackes,
        int niveau,
        int xpTotal
) {
}
