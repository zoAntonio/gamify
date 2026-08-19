-- Données de démarrage pour pouvoir tester le backoffice de bout en bout sans
-- passer par l'admin à la main : une saison active + un catalogue de badges
-- Bronze/Argent/Or pour les 5 domaines système (seedés en V3). Seuils de
-- validations arbitraires (point de départ) — ajustables ensuite depuis
-- /admin/badges (BadgeDefinitionController) sans nouvelle migration, puisque
-- le catalogue reste éditable en base après ce seed initial.

INSERT INTO saisons (nom, date_debut, date_fin, cloturee, created_at, updated_at)
VALUES (
    'Saison 1',
    (CURRENT_DATE - INTERVAL '1 month')::date,
    (CURRENT_DATE + INTERVAL '2 months')::date,
    FALSE,
    now(),
    now()
);

INSERT INTO badge_definitions (domaine_id, palier, nom, description, seuil_validations, actif, created_at, updated_at)
SELECT id, 'BRONZE', nom || ' - Bronze', '5 validations dans le domaine sur la saison', 5, TRUE, now(), now()
FROM domaines WHERE nom IN ('Maths', 'Sport', 'Langues', 'Programmation', 'Musique')
UNION ALL
SELECT id, 'ARGENT', nom || ' - Argent', '15 validations dans le domaine sur la saison', 15, TRUE, now(), now()
FROM domaines WHERE nom IN ('Maths', 'Sport', 'Langues', 'Programmation', 'Musique')
UNION ALL
SELECT id, 'OR', nom || ' - Or', '30 validations dans le domaine sur la saison', 30, TRUE, now(), now()
FROM domaines WHERE nom IN ('Maths', 'Sport', 'Langues', 'Programmation', 'Musique');
