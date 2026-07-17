package com.gamify.application.services;

import com.gamify.application.dtos.agenda.AgendaEventRequest;
import com.gamify.application.dtos.agenda.AgendaEventResponse;
import com.gamify.domain.entities.Activity;
import com.gamify.domain.entities.AgendaEvent;
import com.gamify.domain.entities.User;
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

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgendaService {

    private final AgendaEventRepository agendaEventRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Transactional
    public AgendaEventResponse create(String email, AgendaEventRequest request) {
        User user = findUserByEmail(email);
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
        agendaEventRepository.save(event);

        log.info("Événement '{}' modifié par {}", event.getTitre(), email);
        return toResponse(event);
    }

    @Transactional
    public void delete(String email, Long eventId) {
        User user = findUserByEmail(email);
        AgendaEvent event = findOwnedEvent(eventId, user);
        agendaEventRepository.delete(event);
        log.info("Événement '{}' supprimé par {}", event.getTitre(), email);
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
                activity != null ? activity.getStatut() : null
        );
    }
}
