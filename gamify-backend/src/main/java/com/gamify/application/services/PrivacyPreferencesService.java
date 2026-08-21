package com.gamify.application.services;

import com.gamify.application.dtos.social.PrivacyPreferencesResponse;
import com.gamify.application.dtos.social.UpdatePrivacyPreferencesRequest;
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
 * Réglage de visibilité du profil (G2-T17, domain.md "Multi-utilisateurs") :
 * un seul interrupteur, opt-in explicite et désactivé par défaut (voir la
 * migration V21 — contrairement aux notifications de V20 dont le défaut sûr
 * était "actif", ici le défaut sûr est "rien n'est exposé"). Même patron que
 * {@link NotificationPreferencesService} : stocké sur {@link UserProfile},
 * pas de nouvelle entité pour un seul booléen.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PrivacyPreferencesService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public PrivacyPreferencesResponse getPreferences(String email) {
        return toResponse(findProfile(email));
    }

    @Transactional
    public PrivacyPreferencesResponse updatePreferences(String email, UpdatePrivacyPreferencesRequest request) {
        UserProfile profile = findProfile(email);
        profile.setProfilPublic(request.profilPublic());
        userProfileRepository.save(profile);

        log.info("Visibilité du profil mise à jour pour {} (profilPublic={})", email, request.profilPublic());
        return toResponse(profile);
    }

    private UserProfile findProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Profil introuvable"));
    }

    private PrivacyPreferencesResponse toResponse(UserProfile profile) {
        return new PrivacyPreferencesResponse(profile.isProfilPublic());
    }
}
