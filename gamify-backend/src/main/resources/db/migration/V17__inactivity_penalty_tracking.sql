-- Malus d'inactivité (G1-T04, domain.md) : compteur de jours consécutifs sans
-- gain par attribut (remis à zéro dès qu'un gain a lieu ce jour-là, incrémenté
-- par le job de minuit) + dernier jour évalué par utilisateur (idempotence et
-- rattrapage du job en cas d'arrêt serveur). Conséquence de UserProfile.java
-- (voir champs joursSansActivite* / derniereEvaluationPenalites), jamais l'inverse.

ALTER TABLE user_profiles
    ADD COLUMN jours_sans_activite_intelligence INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN jours_sans_activite_force        INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN jours_sans_activite_vitalite     INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN jours_sans_activite_precision    INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN jours_sans_activite_charisme     INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN jours_sans_activite_resistance   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN derniere_evaluation_penalites    DATE NOT NULL DEFAULT CURRENT_DATE;
