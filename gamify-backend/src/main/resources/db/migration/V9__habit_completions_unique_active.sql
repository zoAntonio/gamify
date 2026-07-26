-- La contrainte d'unicité (habit_id, date_completion) posée en V6 portait sur
-- TOUTES les lignes, y compris annulées (V8) : elle empêchait donc de recocher une
-- habitude le même jour après une annulation logique. On la remplace par un index
-- unique partiel qui ne porte que sur les complétions actives (annule = false),
-- une même date pouvant avoir plusieurs lignes historiques (check/annulation
-- répétés) tant qu'une seule est active à la fois.

ALTER TABLE habit_completions DROP CONSTRAINT uq_habit_completions_habit_date;

CREATE UNIQUE INDEX uq_habit_completions_habit_date_active
    ON habit_completions (habit_id, date_completion)
    WHERE NOT annule;
