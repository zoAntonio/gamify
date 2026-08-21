package com.gamify.application.dtos.social;

/**
 * Une ligne de classement social (G2-T17). {@code valeurAttribut} est {@code null}
 * pour le classement général (tri xpTotal/niveau) et renseigné uniquement quand un
 * attribut est demandé (tri sur ce seul attribut) — un seul DTO pour les deux cas,
 * même patron que {@code UserRankResponse} côté backoffice mais restreint aux
 * profils opt-in ({@code UserProfile.profilPublic}).
 */
public record RankResponse(
        Long userId,
        String username,
        int niveau,
        int xpTotal,
        Integer valeurAttribut,
        int rang
) {
}
