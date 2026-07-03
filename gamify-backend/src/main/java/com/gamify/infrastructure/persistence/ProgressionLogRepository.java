package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.ProgressionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressionLogRepository extends JpaRepository<ProgressionLog, Long> {
    List<ProgressionLog> findByUserId(Long userId);
}
