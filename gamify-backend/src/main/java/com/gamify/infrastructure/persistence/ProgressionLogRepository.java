package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.ProgressionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProgressionLogRepository extends JpaRepository<ProgressionLog, Long> {
    List<ProgressionLog> findByUserId(Long userId);

    List<ProgressionLog> findByUserIdAndDateGreaterThanEqual(Long userId, LocalDateTime date);

    Page<ProgressionLog> findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
            Long userId, LocalDateTime date, Pageable pageable);

    /**
     * Utilisé par {@code InactivityPenaltyService} pour savoir si un attribut a été
     * gagné (delta positif) un jour donné — sert de base à la décision "manque" du
     * job de minuit (domain.md).
     */
    boolean existsByUserIdAndAttributAndDateGreaterThanEqualAndDateLessThanAndDeltaGreaterThan(
            Long userId, String attribut, LocalDateTime from, LocalDateTime to, int delta);

    /**
     * Fil d'activité social (G2-T17) : uniquement les gains (delta positif — une
     * pénalité de minuit n'a rien de "social", jamais affichée ici) des utilisateurs
     * dont le profil est public (opt-in, {@code UserProfile.profilPublic}). Badges
     * débloqués volontairement pas inclus dans ce flux (déjà visibles via la
     * galerie/le classement, voir écarts roadmap.md) — garde la requête sur une
     * seule table, pas de fusion in-memory de deux sources hétérogènes.
     */
    @Query("""
            SELECT pl FROM ProgressionLog pl
            WHERE pl.delta > 0
            AND pl.user.id IN (SELECT up.id FROM UserProfile up WHERE up.profilPublic = true)
            ORDER BY pl.date DESC
            """)
    Page<ProgressionLog> findRecentPublicGains(Pageable pageable);
}
