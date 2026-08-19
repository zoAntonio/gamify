-- Saisons du système d'achievement (~3 mois, gérées manuellement par l'admin
-- depuis le backoffice). Au plus une saison active (non clôturée) à la fois :
-- index unique partiel sur l'expression cloturee=false (même patron que l'index
-- partiel de V9 sur habit_completions).
CREATE TABLE saisons (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    cloturee BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_saisons_dates CHECK (date_fin > date_debut)
);

CREATE UNIQUE INDEX uq_saisons_une_active ON saisons (cloturee) WHERE NOT cloturee;
