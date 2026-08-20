package com.gamify.infrastructure.persistence;

import com.gamify.domain.entities.Habit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    Page<Habit> findByUserIdAndActifTrue(Long userId, Pageable pageable);
}
