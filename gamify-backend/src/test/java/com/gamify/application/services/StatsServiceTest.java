package com.gamify.application.services;

import com.gamify.application.dtos.stats.PointProgressionResponse;
import com.gamify.application.dtos.stats.ProgressionLogResponse;
import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.User;
import com.gamify.domain.enums.PeriodeStats;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Ticket dette technique (tests automatisés) : agrégation de progression de
 * {@link StatsService} (`/api/stats/progression`, buckets zéros compris — domain.md
 * "L1-T06").
 */
@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    private ProgressionLogRepository progressionLogRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StatsService sut;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    private ProgressionLog log(LocalDate date, int delta, int xpAvant, int xpApres) {
        ProgressionLog entry = new ProgressionLog();
        entry.setUser(user);
        entry.setDate(date.atTime(10, 0));
        entry.setDelta(delta);
        entry.setXpAvant(xpAvant);
        entry.setXpApres(xpApres);
        entry.setAttribut("FOR");
        entry.setSource("Test");
        return entry;
    }

    @Test
    void progression_semaine_retourneSeptPointsAvecZerosSurLesJoursSansLog() {
        LocalDate today = LocalDate.now();
        LocalDate jourAvecGain = today.minusDays(2);
        when(progressionLogRepository.findByUserIdAndDateGreaterThanEqual(eq(user.getId()), any()))
                .thenReturn(List.of(log(jourAvecGain, 1, 0, 10)));

        List<PointProgressionResponse> points = sut.progression(user.getEmail(), PeriodeStats.SEMAINE);

        assertThat(points).hasSize(7);
        PointProgressionResponse pointAvecGain = points.stream()
                .filter(point -> point.date().equals(jourAvecGain))
                .findFirst()
                .orElseThrow();
        assertThat(pointAvecGain.gainsAttributs()).isEqualTo(1);
        assertThat(pointAvecGain.xpGagne()).isEqualTo(10);

        long joursAZero = points.stream()
                .filter(point -> !point.date().equals(jourAvecGain))
                .filter(point -> point.gainsAttributs() == 0 && point.xpGagne() == 0)
                .count();
        assertThat(joursAZero).isEqualTo(6);
    }

    @Test
    void progression_mois_retourneTrentePoints() {
        when(progressionLogRepository.findByUserIdAndDateGreaterThanEqual(eq(user.getId()), any()))
                .thenReturn(List.of());

        List<PointProgressionResponse> points = sut.progression(user.getEmail(), PeriodeStats.MOIS);

        assertThat(points).hasSize(30);
        assertThat(points).allSatisfy(point -> {
            assertThat(point.gainsAttributs()).isZero();
            assertThat(point.xpGagne()).isZero();
        });
    }

    @Test
    void progression_annee_agregeParMoisSurDouzeBuckets() {
        LocalDate today = LocalDate.now();
        LocalDate moisCourant = today.withDayOfMonth(1);
        LocalDate moisPrecedent = moisCourant.minusMonths(1);
        when(progressionLogRepository.findByUserIdAndDateGreaterThanEqual(eq(user.getId()), any()))
                .thenReturn(List.of(
                        log(moisCourant.plusDays(2), 1, 0, 10),
                        log(moisCourant.plusDays(5), 1, 10, 25),
                        log(moisPrecedent.plusDays(1), 1, 0, 5)));

        List<PointProgressionResponse> points = sut.progression(user.getEmail(), PeriodeStats.ANNEE);

        assertThat(points).hasSize(12);
        PointProgressionResponse pointMoisCourant = points.stream()
                .filter(point -> point.date().equals(moisCourant))
                .findFirst()
                .orElseThrow();
        // 2 gains ce mois-ci (deltas positifs), XP cumulé = (10-0) + (25-10) = 25
        assertThat(pointMoisCourant.gainsAttributs()).isEqualTo(2);
        assertThat(pointMoisCourant.xpGagne()).isEqualTo(25);

        PointProgressionResponse pointMoisPrecedent = points.stream()
                .filter(point -> point.date().equals(moisPrecedent))
                .findFirst()
                .orElseThrow();
        assertThat(pointMoisPrecedent.gainsAttributs()).isEqualTo(1);
        assertThat(pointMoisPrecedent.xpGagne()).isEqualTo(5);
    }

    @Test
    void journalDuJour_mappeLesLogsEnReponsesAvecXpGagneCalcule() {
        Pageable pageable = PageRequest.of(0, 20);
        ProgressionLog entry = log(LocalDate.now(), 1, 10, 25);
        when(progressionLogRepository.findByUserIdAndDateGreaterThanEqualOrderByDateDesc(
                eq(user.getId()), any(LocalDateTime.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(entry)));

        var page = sut.journalDuJour(user.getEmail(), pageable);

        assertThat(page.getContent()).hasSize(1);
        ProgressionLogResponse response = page.getContent().get(0);
        assertThat(response.attribut()).isEqualTo("FOR");
        assertThat(response.delta()).isEqualTo(1);
        assertThat(response.xpGagne()).isEqualTo(15);
    }

    @Test
    void progression_utilisateurInconnu_leveNotFoundException() {
        when(userRepository.findByEmail("inconnu@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sut.progression("inconnu@test.com", PeriodeStats.SEMAINE))
                .isInstanceOf(NotFoundException.class);
    }
}
