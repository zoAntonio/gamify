package com.gamify.application.dtos.profile;

import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.Avatar;

import java.util.List;
import java.util.Map;

public record ProfileResponse(
        String username,
        String email,
        Avatar avatar,
        String avatarUrl,
        List<DomaineResponse> domainesTrackes,
        int niveau,
        String titre,
        int xpTotal,
        int xpProchainNiveau,
        Map<Attribut, Integer> attributs
) {
}
