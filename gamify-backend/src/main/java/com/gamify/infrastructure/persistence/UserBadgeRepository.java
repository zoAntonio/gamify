package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    boolean existsByUserIdAndBadgeDefinitionIdAndSaisonId(Long userId, Long badgeDefinitionId, Long saisonId);
    List<UserBadge> findByUserIdAndSaisonId(Long userId, Long saisonId);

    // Historique complet (toutes saisons confondues), le plus récent d'abord — galerie
    // utilisateur (G2-T15) : un badge obtenu lors d'une saison déjà clôturée reste acquis,
    // il ne doit pas disparaître du profil.
    List<UserBadge> findByUserIdOrderByDateObtentionDesc(Long userId);
}
