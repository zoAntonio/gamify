package com.gamify.application.services;

import com.gamify.application.dtos.agenda.AgendaEventRequest;
import com.gamify.application.dtos.agenda.AgendaEventResponse;
import com.gamify.application.dtos.agenda.AgendaSeriesUpdateRequest;
import com.gamify.application.dtos.agenda.RecurrenceRequest;
import com.gamify.domain.entities.Activity;
import com.gamify.domain.entities.AgendaEvent;
import com.gamify.domain.entities.User;
import com.gamify.domain.enums.Frequence;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.ForbiddenException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.ActivityRepository;
import com.gamify.infrastructure.persistence.AgendaEventRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgendaService {

    // Horizon maximum d'une série récurrente (décision utilisateur, G1-T10) :
    // date de fin de récurrence obligatoire, bornée à 1 an après le début — pas
    // de récurrence infinie, pas de job de régénération à ajouter.
    private static final int RECURRENCE_HORIZON_DAYS = 366;

    private final AgendaEventRepository agendaEventRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Transactional
    public AgendaEventResponse create(String email, AgendaEventRequest request) {
        User user = findUserByEmail(email);

        if (request.recurrence() != null) {
            return createSeries(email, user, request);
        }

        AgendaEvent event = new AgendaEvent();
        event.setUser(user);
        applyRequest(event, request, user);
        agendaEventRepository.save(event);

        log.info("Événement '{}' créé par {} ({} → {})",
                event.getTitre(), email, event.getDateDebut(), event.getDateFin());
        return toResponse(event);
    }

    @Transactional(readOnly = true)
    public Page<AgendaEventResponse> list(
            String email, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        User user = findUserByEmail(email);
        if (!to.isAfter(from)) {
            throw new DomainException("La borne de fin doit être après la borne de début");
        }
        return agendaEventRepository
                .findByUserIdAndDateDebutBetween(user.getId(), from, to, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public AgendaEventResponse update(String email, Long eventId, AgendaEventRequest request) {
        User user = findUserByEmail(email);
        AgendaEvent event = findOwnedEvent(eventId, user);
        applyRequest(event, request, user);

        // Toute édition directe d'une occurrence la détache de sa série : les
        // futures opérations "toute la série" (update/regénération, suppression
        // exceptée) ne la toucheront plus. C'est ce qui matérialise "modifier
        // cette occurrence seule" sans endpoint dédié — le drag & drop, qui
        // appelle ce même endpoint, détache donc aussi l'occurrence déplacée.
        if (event.getSerieId() != null && !event.isDetachee()) {
            event.setDetachee(true);
        }
        agendaEventRepository.save(event);

        log.info("Événement '{}' modifié par {}", event.getTitre(), email);
        return toResponse(event);
    }

    @Transactional
    public void updateSeries(String email, Long eventId, AgendaSeriesUpdateRequest request) {
        if (!request.heureFin().isAfter(request.heureDebut())) {
            throw new DomainException("L'heure de fin doit être après l'heure de début");
        }

        User user = findUserByEmail(email);
        Long serieId = resolveSerieId(eventId, user);
        List<AgendaEvent> serie = findOwnedSerie(serieId, user);
        Activity activity = resolveActivity(request.activityId(), user);

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        List<DayOfWeek> joursSemaine = validateRecurrence(request.recurrence(), today);
        String joursCsv = toCsv(joursSemaine);

        List<AgendaEvent> futuresASupprimer = new ArrayList<>();
        // Dates déjà couvertes par une occurrence passée conservée en place — la
        // régénération ci-dessous doit les exclure, sinon "aujourd'hui" pourrait
        // recevoir à la fois sa ligne passée mise à jour et une ligne régénérée
        // (la fenêtre de régénération démarre à `today`, qui peut coïncider avec
        // une occurrence déjà passée dans la journée).
        Set<LocalDate> datesDejaCouvertes = new HashSet<>();
        int passeesMisesAJour = 0;
        for (AgendaEvent occurrence : serie) {
            if (occurrence.isDetachee()) continue;

            if (occurrence.getDateDebut().isBefore(now)) {
                // Occurrence déjà passée : on ne déplace jamais où elle a eu lieu,
                // seulement titre/activité/heure-du-jour, sur sa date d'origine.
                LocalDate date = occurrence.getDateDebut().toLocalDate();
                occurrence.setTitre(request.titre());
                occurrence.setActivity(activity);
                occurrence.setDateDebut(LocalDateTime.of(date, request.heureDebut()));
                occurrence.setDateFin(LocalDateTime.of(date, request.heureFin()));
                agendaEventRepository.save(occurrence);
                datesDejaCouvertes.add(date);
                passeesMisesAJour++;
            } else {
                futuresASupprimer.add(occurrence);
            }
        }
        agendaEventRepository.deleteAll(futuresASupprimer);

        List<AgendaEvent> nouvellesOccurrences = generateOccurrenceDates(
                today, request.recurrence().finRecurrence(), request.recurrence().frequence(), joursSemaine)
                .stream()
                .filter(date -> !datesDejaCouvertes.contains(date))
                .filter(date -> !LocalDateTime.of(date, request.heureDebut()).isBefore(now))
                .map(date -> buildOccurrence(
                        user, request.titre(), date, request.heureDebut(), request.heureFin(),
                        activity, serieId, request.recurrence().frequence(), joursCsv,
                        request.recurrence().finRecurrence()))
                .toList();
        agendaEventRepository.saveAll(nouvellesOccurrences);

        log.info("Série {} modifiée par {} : {} occurrence(s) passée(s) mise(s) à jour, "
                        + "{} future(s) régénérée(s), {} détachée(s) inchangée(s)",
                serieId, email, passeesMisesAJour, nouvellesOccurrences.size(),
                serie.size() - passeesMisesAJour - futuresASupprimer.size());
    }

    @Transactional
    public void delete(String email, Long eventId) {
        User user = findUserByEmail(email);
        AgendaEvent event = findOwnedEvent(eventId, user);
        agendaEventRepository.delete(event);
        log.info("Événement '{}' supprimé par {}", event.getTitre(), email);
    }

    @Transactional
    public void deleteSeries(String email, Long eventId) {
        User user = findUserByEmail(email);
        Long serieId = resolveSerieId(eventId, user);
        List<AgendaEvent> serie = findOwnedSerie(serieId, user);

        agendaEventRepository.deleteAll(serie);
        log.info("Série {} ({} occurrence(s), y compris détachées) supprimée par {}",
                serieId, serie.size(), email);
    }

    private AgendaEventResponse createSeries(String email, User user, AgendaEventRequest request) {
        if (!request.dateFin().isAfter(request.dateDebut())) {
            throw new DomainException("La fin de l'événement doit être après son début");
        }

        LocalDate startDate = request.dateDebut().toLocalDate();
        RecurrenceRequest recurrence = request.recurrence();
        List<DayOfWeek> joursSemaine = validateRecurrence(recurrence, startDate);
        String joursCsv = toCsv(joursSemaine);
        Activity activity = resolveActivity(request.activityId(), user);
        LocalTime heureDebut = request.dateDebut().toLocalTime();
        LocalTime heureFin = request.dateFin().toLocalTime();

        List<AgendaEvent> occurrences = generateOccurrenceDates(
                startDate, recurrence.finRecurrence(), recurrence.frequence(), joursSemaine)
                .stream()
                .map(date -> buildOccurrence(
                        user, request.titre(), date, heureDebut, heureFin, activity,
                        null, recurrence.frequence(), joursCsv, recurrence.finRecurrence()))
                .collect(Collectors.toCollection(ArrayList::new));

        if (occurrences.isEmpty()) {
            throw new DomainException("Aucune occurrence à générer pour cette règle de récurrence");
        }

        agendaEventRepository.saveAll(occurrences);
        Long serieId = occurrences.get(0).getId();
        occurrences.forEach(occurrence -> occurrence.setSerieId(serieId));
        agendaEventRepository.saveAll(occurrences);

        log.info("Série '{}' créée par {} : {} occurrence(s), serieId={}",
                request.titre(), email, occurrences.size(), serieId);
        return toResponse(occurrences.get(0));
    }

    private Long resolveSerieId(Long eventId, User user) {
        AgendaEvent anchor = findOwnedEvent(eventId, user);
        Long serieId = anchor.getSerieId();
        if (serieId == null) {
            throw new DomainException("Cet événement ne fait pas partie d'une série");
        }
        return serieId;
    }

    private List<AgendaEvent> findOwnedSerie(Long serieId, User user) {
        return agendaEventRepository.findBySerieId(serieId).stream()
                .filter(occurrence -> occurrence.getUser().getId().equals(user.getId()))
                .toList();
    }

    private AgendaEvent buildOccurrence(
            User user, String titre, LocalDate date, LocalTime heureDebut, LocalTime heureFin,
            Activity activity, Long serieId, Frequence frequence, String joursCsv, LocalDate finRecurrence) {
        AgendaEvent occurrence = new AgendaEvent();
        occurrence.setUser(user);
        occurrence.setTitre(titre);
        occurrence.setDateDebut(LocalDateTime.of(date, heureDebut));
        occurrence.setDateFin(LocalDateTime.of(date, heureFin));
        occurrence.setActivity(activity);
        occurrence.setSerieId(serieId);
        occurrence.setFrequenceRecurrence(frequence);
        occurrence.setJoursSemaine(joursCsv);
        occurrence.setFinRecurrence(finRecurrence);
        return occurrence;
    }

    private List<DayOfWeek> validateRecurrence(RecurrenceRequest recurrence, LocalDate reference) {
        LocalDate finRecurrence = recurrence.finRecurrence();
        if (finRecurrence.isBefore(reference)) {
            throw new DomainException("La date de fin de récurrence doit être après le début");
        }
        if (finRecurrence.isAfter(reference.plusDays(RECURRENCE_HORIZON_DAYS))) {
            throw new DomainException("Une récurrence ne peut pas dépasser 1 an");
        }

        List<DayOfWeek> joursSemaine = recurrence.joursSemaine() == null ? List.of() : recurrence.joursSemaine();
        if (recurrence.frequence() == Frequence.HEBDOMADAIRE && joursSemaine.isEmpty()) {
            throw new DomainException("Sélectionne au moins un jour de la semaine pour une récurrence hebdomadaire");
        }
        return joursSemaine;
    }

    // Génère les dates d'occurrence entre start et end (inclus) selon la
    // fréquence. MENSUEL reproduit le jour du mois de `start` — limite connue et
    // acceptée : un départ le 31 saute les mois plus courts (pas de repli
    // "dernier jour du mois"). Package-private (pas private) pour être testable
    // directement en JUnit, cf. AgendaServiceTest.
    static List<LocalDate> generateOccurrenceDates(
            LocalDate start, LocalDate end, Frequence frequence, List<DayOfWeek> joursSemaine) {
        List<LocalDate> dates = new ArrayList<>();
        if (end.isBefore(start)) return dates;

        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            boolean inclure = switch (frequence) {
                case QUOTIDIEN -> true;
                case HEBDOMADAIRE -> joursSemaine.contains(cursor.getDayOfWeek());
                case MENSUEL -> cursor.getDayOfMonth() == start.getDayOfMonth();
            };
            if (inclure) dates.add(cursor);
            cursor = cursor.plusDays(1);
        }
        return dates;
    }

    private static String toCsv(List<DayOfWeek> joursSemaine) {
        if (joursSemaine == null || joursSemaine.isEmpty()) return null;
        return joursSemaine.stream().map(Enum::name).collect(Collectors.joining(","));
    }

    private static List<DayOfWeek> fromCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(DayOfWeek::valueOf).toList();
    }

    private void applyRequest(AgendaEvent event, AgendaEventRequest request, User user) {
        if (!request.dateFin().isAfter(request.dateDebut())) {
            throw new DomainException("La fin de l'événement doit être après son début");
        }

        event.setTitre(request.titre());
        event.setDateDebut(request.dateDebut());
        event.setDateFin(request.dateFin());
        event.setActivity(resolveActivity(request.activityId(), user));
    }

    private Activity resolveActivity(Long activityId, User user) {
        if (activityId == null) return null;

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NotFoundException("Tâche introuvable"));
        if (!activity.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cette tâche ne t'appartient pas");
        }
        return activity;
    }

    private AgendaEvent findOwnedEvent(Long eventId, User user) {
        AgendaEvent event = agendaEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Événement introuvable"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cet événement ne t'appartient pas");
        }

        return event;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private AgendaEventResponse toResponse(AgendaEvent event) {
        Activity activity = event.getActivity();
        return new AgendaEventResponse(
                event.getId(),
                event.getTitre(),
                event.getDateDebut(),
                event.getDateFin(),
                activity != null ? activity.getId() : null,
                activity != null ? activity.getNom() : null,
                activity != null ? activity.getStatut() : null,
                event.getSerieId(),
                event.getFrequenceRecurrence(),
                fromCsv(event.getJoursSemaine()),
                event.getFinRecurrence(),
                event.isDetachee()
        );
    }
}
