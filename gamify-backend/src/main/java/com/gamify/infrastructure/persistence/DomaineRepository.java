package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DomaineRepository extends JpaRepository<Domaine, Long> {

    @Query("SELECT d FROM Domaine d WHERE d.actif = true AND (d.creePar IS NULL OR d.creePar = :user)")
    List<Domaine> findAvailableForUser(@Param("user") User user);
}
