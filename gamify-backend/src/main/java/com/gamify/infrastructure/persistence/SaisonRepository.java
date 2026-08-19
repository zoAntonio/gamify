package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.Saison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SaisonRepository extends JpaRepository<Saison, Long> {
    Optional<Saison> findByClotureeFalse();
}
