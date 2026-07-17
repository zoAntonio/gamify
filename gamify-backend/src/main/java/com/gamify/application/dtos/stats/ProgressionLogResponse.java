package com.gamify.application.dtos.stats;

import java.time.LocalDateTime;

public record ProgressionLogResponse(
        Long id,
        String attribut,
        int delta,
        String source,
        int xpGagne,
        LocalDateTime date
) {
}
