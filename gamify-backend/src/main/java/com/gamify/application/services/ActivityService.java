package com.gamify.application.services;

import com.gamify.application.dtos.activity.ActivityRequest;
import com.gamify.application.dtos.activity.ActivityResponse;
import com.gamify.domain.entities.Activity;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.StatutKanban;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.ForbiddenException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.ActivityRepository;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.imageio.ImageIO;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    // Bonus d'attribut à la validation (domain.md) : +1 normalement, +2 si une photo
    // preuve est jointe (G2-T16). Même taille max que l'avatar (ImageProcessingService),
    // décision assumée pour rester sur le pattern déjà éprouvé plutôt qu'inventer une
    // nouvelle constante sans besoin exprimé.
    private static final int GAIN_ATTRIBUT_SANS_PHOTO = 1;
    private static final int GAIN_ATTRIBUT_AVEC_PHOTO = 2;
    private static final int PHOTO_MAX_SIZE = 512;

    private final ActivityRepository activityRepository;
    private final DomaineRepository domaineRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProgressionLogRepository progressionLogRepository;
    private final BadgeService badgeService;
    private final ImageProcessingService imageProcessingService;

    @Value("${gamify.uploads.dir}")
    private String uploadsDir;

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

    /** @param photo preuve optionnelle (peut être null/vide) — sa présence donne +2 au lieu de +1 (domain.md). */
    @Transactional
    public ActivityResponse valider(String email, Long activityId, MultipartFile photo) {
        User user = findUserByEmail(email);
        Activity activity = findOwnedActivity(activityId, user);

        terminer(activity, user, email, photo);
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
            terminer(activity, user, email, null);
        } else {
            activity.setStatut(statut);
            activityRepository.save(activity);
            log.info("Tâche '{}' déplacée en {} par {}", activity.getNom(), statut, email);
        }

        return toResponse(activity);
    }

    /** Retire la photo preuve d'une tâche déjà validée — ne revient jamais sur le bonus déjà accordé (historisé, jamais réécrit). */
    @Transactional
    public ActivityResponse supprimerPhoto(String email, Long activityId) {
        User user = findUserByEmail(email);
        Activity activity = findOwnedActivity(activityId, user);

        if (activity.getPhotoPreuve() == null) {
            throw new DomainException("Cette tâche n'a pas de photo preuve");
        }

        supprimerFichierPhoto(activity.getPhotoPreuve());
        activity.setPhotoPreuve(null);
        activityRepository.save(activity);

        log.info("Photo preuve supprimée pour la tâche '{}' par {}", activity.getNom(), email);
        return toResponse(activity);
    }

    private void terminer(Activity activity, User user, String email, MultipartFile photo) {
        if (activity.getStatut() == StatutKanban.TERMINE) {
            throw new DomainException("Cette tâche est déjà validée");
        }

        if (photo != null && !photo.isEmpty()) {
            activity.setPhotoPreuve(enregistrerPhoto(photo));
        }
        int gainAttribut = activity.getPhotoPreuve() != null ? GAIN_ATTRIBUT_AVEC_PHOTO : GAIN_ATTRIBUT_SANS_PHOTO;

        activity.setStatut(StatutKanban.TERMINE);
        activity.setCompletedAt(LocalDateTime.now());
        activityRepository.save(activity);

        UserProfile profile = findProfile(user);
        int xpAvant = profile.getXpTotal();
        profile.appliquerGainAttribut(activity.getAttributCible(), gainAttribut);
        profile.ajouterXp(activity.getXpRecompense());
        userProfileRepository.save(profile);
        badgeService.evaluateAndUnlock(user, activity.getDomaine());

        ProgressionLog logEntry = new ProgressionLog();
        logEntry.setUser(user);
        logEntry.setXpAvant(xpAvant);
        logEntry.setXpApres(profile.getXpTotal());
        logEntry.setDelta(gainAttribut);
        logEntry.setSource(activity.getNom());
        logEntry.setAttribut(activity.getAttributCible().name());
        progressionLogRepository.save(logEntry);

        log.info("Tâche '{}' validée par {} (+{} {}, +{} XP{})",
                activity.getNom(), email, gainAttribut, activity.getAttributCible(), activity.getXpRecompense(),
                activity.getPhotoPreuve() != null ? ", avec photo preuve" : "");
    }

    /** Redimensionne (même pattern que l'avatar, ImageProcessingService) et enregistre sous uploads/activity-proofs/. */
    private String enregistrerPhoto(MultipartFile photo) {
        BufferedImage source = imageProcessingService.readAndValidate(photo);
        BufferedImage resized = imageProcessingService.resize(source, PHOTO_MAX_SIZE);

        try {
            Path proofsDir = Paths.get(uploadsDir, "activity-proofs");
            Files.createDirectories(proofsDir);
            String fileName = UUID.randomUUID() + ".jpg";
            ImageIO.write(resized, "jpg", proofsDir.resolve(fileName).toFile());
            return "activity-proofs/" + fileName;
        } catch (IOException e) {
            throw new DomainException("Échec de l'enregistrement de la photo");
        }
    }

    private void supprimerFichierPhoto(String photoPreuve) {
        try {
            Files.deleteIfExists(Paths.get(uploadsDir).resolve(photoPreuve));
        } catch (IOException e) {
            log.warn("Photo preuve non supprimée du disque : {}", photoPreuve);
        }
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

    private UserProfile findProfile(User user) {
        return userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Profil introuvable"));
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
                activity.getCompletedAt(),
                activity.getPhotoPreuve() != null ? "/uploads/" + activity.getPhotoPreuve() : null
        );
    }
}
