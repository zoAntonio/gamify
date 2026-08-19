-- Sépare credentials (users) et données de jeu (user_profiles), relation 1-1
-- à clé partagée (user_profiles.user_id EST users.id, cf. UserProfile.java
-- @MapsId) : la table qui porte le mot de passe hashé n'a plus besoin d'être
-- requêtée/modifiée à chaque gain de point (validation de tâche, check
-- d'habitude...). Jamais de modification d'une migration déjà appliquée
-- (V1-V14) — tout se fait en 3 étapes ici : créer, copier, nettoyer.

CREATE TABLE user_profiles (
    user_id        BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,

    intelligence   INTEGER NOT NULL DEFAULT 10,
    force          INTEGER NOT NULL DEFAULT 10,
    vitalite       INTEGER NOT NULL DEFAULT 10,
    precision      INTEGER NOT NULL DEFAULT 10,
    charisme       INTEGER NOT NULL DEFAULT 10,
    resistance     INTEGER NOT NULL DEFAULT 10,

    xp_total       INTEGER NOT NULL DEFAULT 0,
    niveau         INTEGER NOT NULL DEFAULT 1,
    titre          VARCHAR(255) NOT NULL DEFAULT 'Novice',

    avatar         VARCHAR(30),
    avatar_image   VARCHAR(255),

    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO user_profiles (
    user_id, intelligence, force, vitalite, precision, charisme, resistance,
    xp_total, niveau, titre, avatar, avatar_image, created_at, updated_at
)
SELECT
    id, intelligence, force, vitalite, precision, charisme, resistance,
    xp_total, niveau, titre, avatar, avatar_image, created_at, updated_at
FROM users;

ALTER TABLE users
    DROP COLUMN intelligence,
    DROP COLUMN force,
    DROP COLUMN vitalite,
    DROP COLUMN precision,
    DROP COLUMN charisme,
    DROP COLUMN resistance,
    DROP COLUMN xp_total,
    DROP COLUMN niveau,
    DROP COLUMN titre,
    DROP COLUMN avatar,
    DROP COLUMN avatar_image;

-- user_tracked_domains.user_id (V3) continue de référencer users(id) : c'est
-- toujours valide puisque user_profiles.user_id EST users.id (clé partagée
-- ci-dessus) — aucune migration nécessaire sur cette table, seule l'entité
-- JPA propriétaire de la relation change (UserProfile.domainesTrackes).
