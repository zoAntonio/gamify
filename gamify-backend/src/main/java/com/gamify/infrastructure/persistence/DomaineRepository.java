package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DomaineRepository extends JpaRepository<Domaine, Long> {
    List<Domaine> findByCreeParIsNullOrCreePar(User creePar);
}
