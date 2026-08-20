package com.gamify.application.services;

import com.gamify.application.dtos.stats.PointProgressionResponse;
import com.gamify.application.dtos.stats.ProgressionLogResponse;
import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.User;
import com.gamify.domain.enums.PeriodeStats;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class StatsService {

    private static final DateTimeFormatter JOUR_LABEL =
            DateTimeFormatter.ofPattern("EEE d", Locale.FRENCH);
    private static final DateTimeFormatter MOIS_LABEL =
            DateTimeFormatter.ofPattern("MMM", Locale.FRENCH);

    private final ProgressionLogRepository progressionLogRepository;
    private final UserRepository userRepository;

    /**
     * Points à zéros compris : 7 points-jour (SEMAINE), 30 points-jour (MOIS),
     * 12 points-mois (ANNEE). Liste à taille fixe — non paginée, écart assumé
     * comme /api/domaines (roadmap).
     */
    @Transactional(readOnly = true)
    public List<PointProgressionResponse> progression(String email, PeriodeStats periode) {
        User user = findUserByEmail(email);
        LocalDate today = LocalDate.now();

        return switch (periode) {
            case SEMAINE -> pointsParJour(user, today.minusDays(6), 7);
            case MOIS -> pointsParJour(user, today.minusDays(29), 30);
            case ANNEE -> pointsParMois(user, today);
        };
    }

    @Transactional(readOnly = true)
    public Page<ProgressionLogResponse> journalDuJour(String email, Pageable pageable) {
        User user = findUserByEmail(email);
        return progressionLogRepository
                .findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                        user.getId(), LocalDate.now().atStartOfDay(), pageable)
                .map(this::toLogResponse);
    }

    private List<PointProgressionResponse> pointsParJour(User user, LocalDate from, int nbJours) {
        Map<LocalDate, List<ProgressionLog>> parJour = logsDepuis(user, from.atStartOfDay())
                .collect(Collectors.groupingBy(entry -> entry.getDate().toLocalDate()));

        List<PointProgressionResponse> points = new ArrayList<>(nbJours);
        for (int i = 0; i < nbJours; i++) {
            LocalDate day = from.plusDays(i);
            points.add(toPoint(day.format(JOUR_LABEL), day, parJour.get(day)));
        }
        return points;
    }

    private List<PointProgressionResponse> pointsParMois(User user, LocalDate today) {
        LocalDate firstMonth = today.withDayOfMonth(1).minusMonths(11);
        Map<LocalDate, List<ProgressionLog>> parMois = logsDepuis(user, firstMonth.atStartOfDay())
                .collect(Collectors.groupingBy(entry -> entry.getDate().toLocalDate().withDayOfMonth(1)));

        List<PointProgressionResponse> points = new ArrayList<>(12);
        for (int i = 0; i < 12; i++) {
            LocalDate month = firstMonth.plusMonths(i);
            points.add(toPoint(month.format(MOIS_LABEL), month, parMois.get(month)));
        }
        return points;
    }

    private Stream<ProgressionLog> logsDepuis(User user, LocalDateTime from) {
        return progressionLogRepository
                .findByUserIdAndDateGreaterThanEqual(user.getId(), from)
                .stream();
    }

    private PointProgressionResponse toPoint(String label, LocalDate date, List<ProgressionLog> logs) {
        if (logs == null) {
            return new PointProgressionResponse(label, date, 0, 0, 0);
        }
        int gains = logs.stream().mapToInt(ProgressionLog::getDelta).filter(delta -> delta > 0).sum();
        int pertes = -logs.stream().mapToInt(ProgressionLog::getDelta).filter(delta -> delta < 0).sum();
        int xp = logs.stream().mapToInt(entry -> entry.getXpApres() - entry.getXpAvant()).sum();
        return new PointProgressionResponse(label, date, gains, pertes, xp);
    }

    private ProgressionLogResponse toLogResponse(ProgressionLog entry) {
        return new ProgressionLogResponse(
                entry.getId(),
                entry.getAttribut(),
                entry.getDelta(),
                entry.getSource(),
                entry.getXpApres() - entry.getXpAvant(),
                entry.getDate()
        );
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }
}
