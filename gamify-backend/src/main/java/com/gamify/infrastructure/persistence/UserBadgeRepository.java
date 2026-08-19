package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    boolean existsByUserIdAndBadgeDefinitionIdAndSaisonId(Long userId, Long badgeDefinitionId, Long saisonId);
    List<UserBadge> findByUserIdAndSaisonId(Long userId, Long saisonId);
}
