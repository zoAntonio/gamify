package com.gamify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling : job de minuit des pénalités d'inactivité (G1-T04, domain.md),
// voir InactivityPenaltyScheduler.
@SpringBootApplication
@EnableScheduling
public class GamifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamifyApplication.class, args);
    }

}
