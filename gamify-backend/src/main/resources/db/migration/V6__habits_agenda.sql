-- G1-T10 (agenda) + G1-T11 (habitudes/streaks) : habitudes cochables au jour le
-- jour (grille 12 semaines, streak) et événements d'agenda, liables à une tâche.

CREATE TABLE habits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    nom VARCHAR(255) NOT NULL,
    domaine_id BIGINT REFERENCES domaines (id),
    attribut_cible VARCHAR(20)
        CHECK (attribut_cible IN ('INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES')),
    icone VARCHAR(16),
    couleur VARCHAR(9),
    xp_recompense INTEGER NOT NULL DEFAULT 10,
    meilleur_streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_habits_user_id ON habits (user_id);

-- Append-only (comme progression_logs) : pas de updated_at, l'historique ne
-- s'efface jamais même quand une série est cassée (domain.md).
CREATE TABLE habit_completions (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT NOT NULL REFERENCES habits (id),
    date_completion DATE NOT NULL,
    CONSTRAINT uq_habit_completions_habit_date UNIQUE (habit_id, date_completion)
);

CREATE INDEX idx_habit_completions_habit_id ON habit_completions (habit_id);

CREATE TABLE agenda_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    titre VARCHAR(255) NOT NULL,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    activity_id BIGINT REFERENCES activities (id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_agenda_events_dates CHECK (date_fin > date_debut)
);

CREATE INDEX idx_agenda_events_user_id ON agenda_events (user_id);
CREATE INDEX idx_agenda_events_date_debut ON agenda_events (date_debut);
