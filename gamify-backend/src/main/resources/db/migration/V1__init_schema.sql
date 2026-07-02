-- Schéma initial Gamify : reflète les entités JPA
-- com.gamify.user.User, com.gamify.activity.Activity, com.gamify.progression.ProgressionLog

CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(255) NOT NULL UNIQUE,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,

    -- Attributs RPG
    intelligence   INTEGER NOT NULL DEFAULT 0,
    force          INTEGER NOT NULL DEFAULT 0,
    vitesse        INTEGER NOT NULL DEFAULT 0,
    vitalite       INTEGER NOT NULL DEFAULT 0,
    charisme       INTEGER NOT NULL DEFAULT 0,
    resistance     INTEGER NOT NULL DEFAULT 0,
    precision      INTEGER NOT NULL DEFAULT 0,

    -- Progression
    xp_total       INTEGER NOT NULL DEFAULT 0,
    niveau         INTEGER NOT NULL DEFAULT 1,
    titre          VARCHAR(255) NOT NULL DEFAULT 'Novice',

    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE activities (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users (id),

    nom              VARCHAR(255) NOT NULL,
    domaine          VARCHAR(255),
    attribut_cible   VARCHAR(255),
    frequence        VARCHAR(255),
    xp_recompense    INTEGER NOT NULL DEFAULT 50,

    statut           VARCHAR(20) NOT NULL DEFAULT 'A_FAIRE'
                         CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE')),
    confirme         BOOLEAN NOT NULL DEFAULT FALSE,

    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    completed_at     TIMESTAMP
);

CREATE INDEX idx_activities_user_id ON activities (user_id);

CREATE TABLE progression_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users (id),

    xp_avant    INTEGER NOT NULL,
    xp_apres    INTEGER NOT NULL,
    delta       INTEGER NOT NULL,
    source      VARCHAR(255),
    attribut    VARCHAR(255),
    date        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_progression_logs_user_id ON progression_logs (user_id);
