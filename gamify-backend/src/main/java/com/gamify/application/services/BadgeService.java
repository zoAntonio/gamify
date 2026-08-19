package com.gamify.application.services;

import com.gamify.application.dtos.badge.UserBadgeResponse;
import com.gamify.domain.entities.BadgeDefinition;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.Saison;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserBadge;
import com.gamify.infrastructure.persistence.ActivityRepository;
import com.gamify.infrastructure.persistence.BadgeDefinitionRepository;
import com.gamify.infrastructure.persistence.HabitCompletionRepository;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.SaisonRepository;
import com.gamify.infrastructure.persistence.UserBadgeRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Déblocage des badges (Bronze/Argent/Or par domaine, domain.md), saisonnier :
 * le compteur de validations est toujours recalculé dans la fenêtre de la saison
 * active, donc "remise à zéro" tombe de la borne de dates plutôt que d'un reset
 * physique — un même badge peut être regagné à chaque nouvelle saison.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final SaisonRepository saisonRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityRepository activityRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void evaluateAndUnlock(User user, Domaine domaine) {
        if (domaine == null) {
            return;
        }
        Saison saison = saisonRepository.findByClotureeFalse().orElse(null);
        if (saison == null) {
            return;
        }

        long nbValidations = compterValidations(user.getId(), domaine.getId(), saison);

        for (BadgeDefinition badge : badgeDefinitionRepository.findByDomaineIdAndActifTrue(domaine.getId())) {
            if (!badge.estAtteint(nbValidations)) {
                continue;
            }
            if (userBadgeRepository.existsByUserIdAndBadgeDefinitionIdAndSaisonId(
                    user.getId(), badge.getId(), saison.getId())) {
                continue;
            }

            UserBadge userBadge = new UserBadge();
            userBadge.setUser(user);
            userBadge.setBadgeDefinition(badge);
            userBadge.setSaison(saison);
            userBadge.setDateObtention(LocalDateTime.now());
            userBadgeRepository.save(userBadge);

            log.info("Badge '{}' ({}) débloqué pour {} (saison '{}')",
                    badge.getNom(), badge.getPalier(), user.getUsername(), saison.getNom());
        }
    }

    @Transactional(readOnly = true)
    public List<UserBadgeResponse> mesBadges(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        Saison saison = saisonRepository.findByClotureeFalse().orElse(null);
        if (saison == null) {
            return List.of();
        }
        return userBadgeRepository.findByUserIdAndSaisonId(user.getId(), saison.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private long compterValidations(Long userId, Long domaineId, Saison saison) {
        LocalDateTime debut = saison.getDateDebut().atStartOfDay();
        LocalDateTime fin = saison.getDateFin().atTime(LocalTime.MAX);

        long activites = activityRepository.countValideesDansDomaineEtPeriode(userId, domaineId, debut, fin);
        long habitudes = habitCompletionRepository
                .countValideesDansDomaineEtPeriode(userId, domaineId, saison.getDateDebut(), saison.getDateFin());
        return activites + habitudes;
    }

    private UserBadgeResponse toResponse(UserBadge userBadge) {
        return new UserBadgeResponse(
                userBadge.getId(),
                userBadge.getBadgeDefinition().getNom(),
                userBadge.getBadgeDefinition().getPalier(),
                userBadge.getBadgeDefinition().getDomaine().getNom(),
                userBadge.getSaison().getNom(),
                userBadge.getDateObtention()
        );
    }
}
