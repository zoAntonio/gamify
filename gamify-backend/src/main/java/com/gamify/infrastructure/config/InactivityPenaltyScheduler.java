package com.gamify.infrastructure.config;

import com.gamify.application.services.InactivityPenaltyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Déclenche le job de pénalités d'inactivité à minuit (domain.md : "les manques
 * sont calculés/appliqués à minuit"), sur le jour qui vient de se terminer.
 *
 * Bean séparé de {@link InactivityPenaltyService} volontairement : un appel
 * {@code this.appliquerPenalitesJusqua(...)} depuis une méthode {@code @Scheduled}
 * de la même classe contournerait le proxy Spring et perdrait le
 * {@code @Transactional} (même piège que documenté pour {@code @Async} dans les
 * conventions backend) — passer par un bean distinct garantit un appel proxifié.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InactivityPenaltyScheduler {

    private final InactivityPenaltyService inactivityPenaltyService;

    @Scheduled(cron = "0 0 0 * * *")
    public void executerPenalitesQuotidiennes() {
        LocalDate hier = LocalDate.now().minusDays(1);
        log.info("Déclenchement planifié du job de pénalités d'inactivité pour le {}", hier);
        inactivityPenaltyService.appliquerPenalitesJusqua(hier);
    }
}
