package com.gamify.application.services;

import com.gamify.application.dtos.badge.BadgeLockedResponse;
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
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    /**
     * Historique complet des badges débloqués par l'utilisateur, toutes saisons
     * confondues (le plus récent d'abord) — un badge reste acquis même après la
     * clôture de la saison où il a été gagné. Élargi depuis la version initiale de
     * G2-T15 (qui ne renvoyait que la saison active) pour servir la galerie
     * utilisateur "acquis, par saison" ; sans impact sur le moteur de notification
     * (`useNotificationEngine`) qui ne fait que comparer des ids d'un sondage à
     * l'autre, quelle que soit la portée renvoyée.
     */
    @Transactional(readOnly = true)
    public List<UserBadgeResponse> mesBadges(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        return userBadgeRepository.findByUserIdOrderByDateObtentionDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Badges du catalogue pas encore débloqués par l'utilisateur pour la saison active
     * (grisés côté galerie, avec la progression actuelle vers le seuil). Liste vide si
     * aucune saison n'est en cours : rien n'est débloquable tant qu'aucune fenêtre de
     * comptage n'est ouverte.
     */
    @Transactional(readOnly = true)
    public List<BadgeLockedResponse> badgesADebloquer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
        Saison saison = saisonRepository.findByClotureeFalse().orElse(null);
        if (saison == null) {
            return List.of();
        }

        Set<Long> dejaObtenusCetteSaison = userBadgeRepository.findByUserIdAndSaisonId(user.getId(), saison.getId())
                .stream()
                .map(userBadge -> userBadge.getBadgeDefinition().getId())
                .collect(Collectors.toSet());

        // Un seul comptage par domaine (pas par badge) : les 3 paliers d'un même
        // domaine partagent la même progression.
        Map<Long, Long> progressionParDomaine = new HashMap<>();

        return badgeDefinitionRepository.findByActifTrue().stream()
                .filter(badge -> !dejaObtenusCetteSaison.contains(badge.getId()))
                .sorted(Comparator.<BadgeDefinition, String>comparing(badge -> badge.getDomaine().getNom())
                        .thenComparing(badge -> badge.getPalier().ordinal()))
                .map(badge -> {
                    long progression = progressionParDomaine.computeIfAbsent(
                            badge.getDomaine().getId(),
                            domaineId -> compterValidations(user.getId(), domaineId, saison));
                    return new BadgeLockedResponse(
                            badge.getId(),
                            badge.getNom(),
                            badge.getDescription(),
                            badge.getPalier(),
                            badge.getDomaine().getNom(),
                            badge.getSeuilValidations(),
                            progression);
                })
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
