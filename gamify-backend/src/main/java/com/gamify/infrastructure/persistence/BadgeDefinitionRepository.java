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
}
