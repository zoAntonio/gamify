-- Backoffice : désactivation logique d'un domaine (jamais de DELETE physique, un
-- domaine désactivé ne casse pas les activités/habitudes/badges qui le référencent
-- déjà, il n'est simplement plus proposable pour de nouvelles créations).
ALTER TABLE domaines ADD COLUMN actif BOOLEAN NOT NULL DEFAULT TRUE;
