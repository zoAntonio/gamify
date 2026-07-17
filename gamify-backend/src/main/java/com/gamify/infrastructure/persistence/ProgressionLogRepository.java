package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.ProgressionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProgressionLogRepository extends JpaRepository<ProgressionLog, Long> {
    List<ProgressionLog> findByUserId(Long userId);

    List<ProgressionLog> findByUserIdAndDateGreaterThanEqual(Long userId, LocalDateTime date);

    Page<ProgressionLog> findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
            Long userId, LocalDateTime date, Pageable pageable);
}
