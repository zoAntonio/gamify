package com.gamify.application.services;

import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Malus de régression (G1-T04, domain.md) : "les manques sont calculés/appliqués
 * à minuit" — contrairement au gain (+1, instantané à la validation dans
 * {@code UserProfile.appliquerGainAttribut}), le malus est évalué a posteriori,
 * un jour calendaire à la fois, par ce service (déclenché par
 * {@link InactivityPenaltyScheduler} en prod, ou manuellement via
 * {@code POST /api/backoffice/penalites/executer} pour le rattrapage/les tests).
 *
 * Portée volontairement limitée aux attributs des domaines que l'utilisateur
 * trackе ({@code UserProfile.domainesTrackes}) — décision prise ici (pas
 * explicite dans domain.md) : évaluer les 6 attributs sans distinction ferait
 * chuter à 0 en quelques jours tout attribut qu'un utilisateur n'a jamais eu la
 * possibilité de faire progresser (aucun domaine/activité/habitude ne le cible),
 * ce qui serait un verrou definitif plutôt qu'un mécanisme d'équilibrage.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InactivityPenaltyService {

    private final UserProfileRepository userProfileRepository;
    private final ProgressionLogRepository progressionLogRepository;

    /**
     * Rejoue le calcul jour par jour pour chaque profil, depuis son dernier jour
     * déjà évalué (exclu) jusqu'à {@code dateLimite} (incluse). Idempotent : un
     * profil déjà à jour n'est pas retouché ; un profil en retard (serveur arrêté
     * un ou plusieurs jours) rattrape chaque jour manqué dans l'ordre.
     */
    @Transactional
    public void appliquerPenalitesJusqua(LocalDate dateLimite) {
        for (UserProfile profile : userProfileRepository.findAllWithUser()) {
            evaluerProfilJusqua(profile, dateLimite);
        }
    }

    private void evaluerProfilJusqua(UserProfile profile, LocalDate dateLimite) {
        LocalDate jour = profile.getDerniereEvaluationPenalites().plusDays(1);
        if (jour.isAfter(dateLimite)) {
            return;
        }

        Set<Attribut> attributsEnJeu = profile.getDomainesTrackes().stream()
                .flatMap(domaine -> domaine.getAttributs().stream())
                .collect(Collectors.toSet());

        while (!jour.isAfter(dateLimite)) {
            evaluerJournee(profile, jour, attributsEnJeu);
            profile.setDerniereEvaluationPenalites(jour);
            jour = jour.plusDays(1);
        }
        userProfileRepository.save(profile);
    }

    private void evaluerJournee(UserProfile profile, LocalDate jour, Set<Attribut> attributsEnJeu) {
        LocalDateTime debutJour = jour.atStartOfDay();
        LocalDateTime finJour = jour.plusDays(1).atStartOfDay();

        for (Attribut attribut : attributsEnJeu) {
            boolean gagne = progressionLogRepository
                    .existsByUserIdAndAttributAndDateGreaterThanEqualAndDateLessThanAndDeltaGreaterThan(
                            profile.getId(), attribut.name(), debutJour, finJour, 0);

            if (gagne) {
                profile.reinitialiserManque(attribut);
                continue;
            }

            UserProfile.MalusInactivite malus = profile.appliquerMalusInactivite(attribut);
            enregistrerMalus(profile, attribut, -malus.malusBase(),
                    "Inactivité — aucune activité sur " + attribut + " le " + jour, jour);

            if (malus.malusConsecutifDeclenche()) {
                enregistrerMalus(profile, attribut, -5,
                        "Inactivité — 3 jours consécutifs sans activité sur " + attribut, jour);
            }
        }

        log.info("Pénalités d'inactivité évaluées pour {} le {} ({} attribut(s) en jeu)",
                profile.getUser().getUsername(), jour, attributsEnJeu.size());
    }

    /**
     * Historise le malus comme les gains actuels (delta négatif) — l'XP n'est
     * jamais touchée par un malus d'attribut (domain.md ne le prévoit pas), donc
     * xpAvant == xpApres. Horodaté à la fin du jour évalué (pas à l'instant du
     * run) pour que le journal/les stats attribuent le malus au bon jour, y
     * compris en cas de rattrapage de plusieurs jours d'un coup.
     */
    private void enregistrerMalus(UserProfile profile, Attribut attribut, int delta, String source, LocalDate jour) {
        ProgressionLog logEntry = new ProgressionLog();
        logEntry.setUser(profile.getUser());
        logEntry.setXpAvant(profile.getXpTotal());
        logEntry.setXpApres(profile.getXpTotal());
        logEntry.setDelta(delta);
        logEntry.setSource(source);
        logEntry.setAttribut(attribut.name());
        logEntry.setDate(jour.atTime(23, 59, 59));
        progressionLogRepository.save(logEntry);
    }
}
