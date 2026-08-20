-- G1-T12 : réglages utilisateur des notifications, 3 catégories activables
-- indépendamment (rappel avant échéance, alerte fin de journée, célébration
-- niveau/badge). Activées par défaut pour ne pas faire disparaître une
-- fonctionnalité que l'utilisateur n'a pas encore vue/désactivée sciemment.
ALTER TABLE user_profiles
    ADD COLUMN notif_rappel_actif BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notif_fin_journee_actif BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notif_celebration_actif BOOLEAN NOT NULL DEFAULT TRUE;
