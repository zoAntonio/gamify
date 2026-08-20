package com.gamify.application.services;

import com.gamify.domain.enums.Frequence;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Ticket G1-T10 (partie restante, récurrence agenda) : {@link AgendaService#generateOccurrenceDates}
 * est la logique pure la plus sensible aux erreurs de date (candidat JUnit isolé, pas besoin de
 * Mockito). Le reste de {@link AgendaService} (create/update/updateSeries/deleteSeries) reste sans
 * test dans ce ticket — dette déjà connue sur cette classe, non aggravée ici (voir roadmap.md).
 */
class AgendaServiceTest {

    @Test
    void generateOccurrenceDates_quotidien_retourneChaqueJour() {
        LocalDate start = LocalDate.of(2026, 8, 20);
        LocalDate end = LocalDate.of(2026, 8, 24);

        List<LocalDate> dates = AgendaService.generateOccurrenceDates(start, end, Frequence.QUOTIDIEN, List.of());

        assertThat(dates).containsExactly(
                LocalDate.of(2026, 8, 20),
                LocalDate.of(2026, 8, 21),
                LocalDate.of(2026, 8, 22),
                LocalDate.of(2026, 8, 23),
                LocalDate.of(2026, 8, 24)
        );
    }

    @Test
    void generateOccurrenceDates_hebdomadaire_neRetientQueLesJoursChoisis() {
        // 2026-08-20 est un jeudi.
        LocalDate start = LocalDate.of(2026, 8, 20);
        LocalDate end = LocalDate.of(2026, 9, 10);

        List<LocalDate> dates = AgendaService.generateOccurrenceDates(
                start, end, Frequence.HEBDOMADAIRE, List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY));

        assertThat(dates).containsExactly(
                LocalDate.of(2026, 8, 24), // lundi
                LocalDate.of(2026, 8, 26), // mercredi
                LocalDate.of(2026, 8, 31),
                LocalDate.of(2026, 9, 2),
                LocalDate.of(2026, 9, 7),
                LocalDate.of(2026, 9, 9)
        );
    }

    @Test
    void generateOccurrenceDates_mensuel_reproduitLeMemeJourDuMois() {
        LocalDate start = LocalDate.of(2026, 1, 15);
        LocalDate end = LocalDate.of(2026, 4, 30);

        List<LocalDate> dates = AgendaService.generateOccurrenceDates(start, end, Frequence.MENSUEL, List.of());

        assertThat(dates).containsExactly(
                LocalDate.of(2026, 1, 15),
                LocalDate.of(2026, 2, 15),
                LocalDate.of(2026, 3, 15),
                LocalDate.of(2026, 4, 15)
        );
    }

    @Test
    void generateOccurrenceDates_mensuelDepartLe31_sauteLesMoisPlusCourts() {
        // Limite connue et acceptée (pas de repli "dernier jour du mois") : février
        // et avril n'ont pas de 31, ces occurrences sont simplement absentes.
        LocalDate start = LocalDate.of(2026, 1, 31);
        LocalDate end = LocalDate.of(2026, 5, 31);

        List<LocalDate> dates = AgendaService.generateOccurrenceDates(start, end, Frequence.MENSUEL, List.of());

        assertThat(dates).containsExactly(
                LocalDate.of(2026, 1, 31),
                LocalDate.of(2026, 3, 31),
                LocalDate.of(2026, 5, 31)
        );
    }

    @Test
    void generateOccurrenceDates_finAvantDebut_retourneListeVide() {
        LocalDate start = LocalDate.of(2026, 8, 20);
        LocalDate end = LocalDate.of(2026, 8, 10);

        List<LocalDate> dates = AgendaService.generateOccurrenceDates(start, end, Frequence.QUOTIDIEN, List.of());

        assertThat(dates).isEmpty();
    }
}
