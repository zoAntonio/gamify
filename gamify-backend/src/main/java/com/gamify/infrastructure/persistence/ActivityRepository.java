package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.Activity;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.StatutKanban;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query("""
            SELECT a FROM Activity a
            WHERE a.user.id = :userId
            AND (:domaineId IS NULL OR a.domaine.id = :domaineId)
            AND (:attributCible IS NULL OR a.attributCible = :attributCible)
            AND (:statut IS NULL OR a.statut = :statut)
            """)
    Page<Activity> search(
            @Param("userId") Long userId,
            @Param("domaineId") Long domaineId,
            @Param("attributCible") Attribut attributCible,
            @Param("statut") StatutKanban statut,
            Pageable pageable
    );
}
