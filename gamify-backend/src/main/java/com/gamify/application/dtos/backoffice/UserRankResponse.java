package com.gamify.application.dtos.backoffice;

public record UserRankResponse(
        Long id,
        String username,
        int niveau,
        int xpTotal,
        int rang
) {
}
