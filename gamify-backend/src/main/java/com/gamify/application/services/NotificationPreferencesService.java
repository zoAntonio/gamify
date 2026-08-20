package com.gamify.application.services;

import com.gamify.application.dtos.notification.NotificationPreferencesResponse;
import com.gamify.application.dtos.notification.UpdateNotificationPreferencesRequest;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Réglages utilisateur des notifications (G1-T12, domain.md section
 * "Notifications") : 3 catégories activables/désactivables indépendamment
 * (rappel ~30 min avant une tâche/événement planifié, alerte ~22h si des
 * tâches du jour restent non validées, célébration niveau/badge). Stockées
 * sur {@link UserProfile} (même relation 1-1 à clé partagée que
 * l'avatar/les domaines trackés) plutôt qu'une nouvelle entité — 3 booléens
 * ne justifient pas une table dédiée.
 *
 * Mécanisme retenu (décision prise pour ce ticket, contrainte "zéro coût" du
 * projet) : pas de Web Push (VAPID + service worker + abonnements persistés
 * en base + librairie serveur dédiée) — trop d'infrastructure nouvelle pour
 * un besoin qui ne demande pas de recevoir une notification app fermée.
 * À la place : détection entièrement côté frontend, par sondage périodique
 * des endpoints déjà existants (`/api/agenda`, `/api/profile`,
 * `/api/badges/me` — voir {@code features/notifications/hooks/useNotificationEngine.ts}),
 * affichage via l'API Notification du navigateur quand la permission est
 * accordée, avec repli systématique sur un bandeau in-app (toujours garanti,
 * y compris onglet au premier plan où le navigateur peut choisir de ne rien
 * afficher). Ce service ne fait donc que lire/écrire les 3 interrupteurs :
 * aucun job planifié ni endpoint de déclenchement ici, contrairement au
 * malus d'inactivité ({@link InactivityPenaltyService}) qui est lui un
 * calcul serveur.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationPreferencesService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getPreferences(String email) {
        return toResponse(findProfile(email));
    }

    @Transactional
    public NotificationPreferencesResponse updatePreferences(String email, UpdateNotificationPreferencesRequest request) {
        UserProfile profile = findProfile(email);
        profile.setNotifRappelActif(request.rappelActif());
        profile.setNotifFinJourneeActif(request.finJourneeActif());
        profile.setNotifCelebrationActif(request.celebrationActif());
        userProfileRepository.save(profile);

        log.info("Préférences de notification mises à jour pour {} (rappel={}, finJournee={}, celebration={})",
                email, request.rappelActif(), request.finJourneeActif(), request.celebrationActif());
        return toResponse(profile);
    }

    private UserProfile findProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Profil introuvable"));
    }

    private NotificationPreferencesResponse toResponse(UserProfile profile) {
        return new NotificationPreferencesResponse(
                profile.isNotifRappelActif(),
                profile.isNotifFinJourneeActif(),
                profile.isNotifCelebrationActif()
        );
    }
}
