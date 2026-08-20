-- Récurrence d'événements d'agenda (G1-T10, partie restante) : occurrences
-- matérialisées (une ligne par occurrence), regroupées par serie_id. Pas de FK
-- sur serie_id (juste une valeur de regroupement, voir AgendaService pour le
-- raisonnement) : une contrainte auto-référencée casserait en supprimant une
-- seule occurrence de la série.

ALTER TABLE agenda_events
    ADD COLUMN serie_id BIGINT,
    ADD COLUMN frequence_recurrence VARCHAR(20),
    ADD COLUMN jours_semaine VARCHAR(100),
    ADD COLUMN fin_recurrence DATE,
    ADD COLUMN detachee BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE agenda_events
    ADD CONSTRAINT chk_agenda_events_frequence_recurrence
        CHECK (frequence_recurrence IN ('QUOTIDIEN', 'HEBDOMADAIRE', 'MENSUEL'));

CREATE INDEX idx_agenda_events_serie_id ON agenda_events (serie_id);
