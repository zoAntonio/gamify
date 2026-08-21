package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.BadgeDefinition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinition, Long> {
    Page<BadgeDefinition> findByDomaineId(Long domaineId, Pageable pageable);
    List<BadgeDefinition> findByDomaineIdAndActifTrue(Long domaineId);

    // Catalogue complet actif, toutes domaines confondus — galerie utilisateur (G2-T15,
    // section "badges à débloquer"). Volumétrie bornée par construction (≤ 3 paliers ×
    // nombre de domaines), même exception de pagination déjà actée sur /api/badges/me et
    // /api/domaines (voir roadmap.md).
    List<BadgeDefinition> findByActifTrue();
}
