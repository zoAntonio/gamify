package com.gamify.application.services;

import com.gamify.application.dtos.activity.ActivityRequest;
import com.gamify.application.dtos.activity.ActivityResponse;
import com.gamify.domain.entities.Activity;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.User;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.StatutKanban;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.ForbiddenException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.ActivityRepository;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
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
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final DomaineRepository domaineRepository;
    private final UserRepository userRepository;
    private final ProgressionLogRepository progressionLogRepository;
    private final BadgeService badgeService;

    @Transactional
    public ActivityResponse create(String email, ActivityRequest request) {
        User user = findUserByEmail(email);
        Domaine domaine = domaineRepository.findById(request.domaineId())
                .orElseThrow(() -> new NotFoundException("Domaine introuvable"));

        if (!domaine.getAttributs().contains(request.attributCible())) {
            throw new DomainException(
                    "L'attribut ciblé doit faire partie des attributs du domaine sélectionné");
        }

        Activity activity = new Activity();
        activity.setUser(user);
        activity.setNom(request.nom());
        activity.setDomaine(domaine);
        activity.setAttributCible(request.attributCible());
        activity.setFrequence(request.frequence());
        activity.setObjectif(request.objectif());
        activityRepository.save(activity);

        log.info("Tâche '{}' créée par {}", activity.getNom(), email);
        return toResponse(activity);
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponse> search(
            String email,
            Long domaineId,
            Attribut attributCible,
            StatutKanban statut,
            Pageable pageable
    ) {
        User user = findUserByEmail(email);
        return activityRepository
                .search(user.getId(), domaineId, attributCible, statut, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ActivityResponse valider(String email, Long activityId) {
        User user = findUserByEmail(email);
        Activity activity = findOwnedActivity(activityId, user);

        terminer(activity, user, email);
        return toResponse(activity);
    }

    @Transactional
    public ActivityResponse changerStatut(String email, Long activityId, StatutKanban statut) {
        User user = findUserByEmail(email);
        Activity activity = findOwnedActivity(activityId, user);

        if (activity.getStatut() == statut) {
            return toResponse(activity);
        }

        // Une tâche terminée a déjà donné ses récompenses : on ne la remet pas en jeu.
        if (activity.getStatut() == StatutKanban.TERMINE) {
            throw new DomainException("Cette tâche est déjà validée");
        }

        if (statut == StatutKanban.TERMINE) {
            terminer(activity, user, email);
        } else {
            activity.setStatut(statut);
            activityRepository.save(activity);
            log.info("Tâche '{}' déplacée en {} par {}", activity.getNom(), statut, email);
        }

        return toResponse(activity);
    }

    private void terminer(Activity activity, User user, String email) {
        if (activity.getStatut() == StatutKanban.TERMINE) {
            throw new DomainException("Cette tâche est déjà validée");
        }

        activity.setStatut(StatutKanban.TERMINE);
        activity.setCompletedAt(LocalDateTime.now());
        activityRepository.save(activity);

        int xpAvant = user.getXpTotal();
        user.appliquerGainAttribut(activity.getAttributCible());
        user.ajouterXp(activity.getXpRecompense());
        userRepository.save(user);
        badgeService.evaluateAndUnlock(user, activity.getDomaine());

        ProgressionLog logEntry = new ProgressionLog();
        logEntry.setUser(user);
        logEntry.setXpAvant(xpAvant);
        logEntry.setXpApres(user.getXpTotal());
        logEntry.setDelta(1);
        logEntry.setSource(activity.getNom());
        logEntry.setAttribut(activity.getAttributCible().name());
        progressionLogRepository.save(logEntry);

        log.info("Tâche '{}' validée par {} (+1 {}, +{} XP)",
                activity.getNom(), email, activity.getAttributCible(), activity.getXpRecompense());
    }

    private Activity findOwnedActivity(Long activityId, User user) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NotFoundException("Tâche introuvable"));

        if (!activity.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cette tâche ne t'appartient pas");
        }

        return activity;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private ActivityResponse toResponse(Activity activity) {
        Domaine domaine = activity.getDomaine();
        return new ActivityResponse(
                activity.getId(),
                activity.getNom(),
                domaine != null ? domaine.getId() : null,
                domaine != null ? domaine.getNom() : null,
                activity.getAttributCible(),
                activity.getFrequence(),
                activity.getObjectif(),
                activity.getXpRecompense(),
                activity.getStatut(),
                activity.getCompletedAt()
        );
    }
}
