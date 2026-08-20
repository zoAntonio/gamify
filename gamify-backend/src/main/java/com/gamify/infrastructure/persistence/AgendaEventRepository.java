package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.AgendaEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendaEventRepository extends JpaRepository<AgendaEvent, Long> {

    Page<AgendaEvent> findByUserIdAndDateDebutBetween(
            Long userId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    List<AgendaEvent> findBySerieId(Long serieId);
}
