-- Annulation logique d'une complétion d'habitude (soft-delete) : habit_completions
-- reste append-only (aucune ligne n'est jamais supprimée), on marque juste annule=true.
-- bonus_applique capture si le bonus de série (+10 XP/7 jours) a été accordé à ce
-- check précis, pour pouvoir le reprendre exactement lors d'une annulation.

ALTER TABLE habit_completions ADD COLUMN annule BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE habit_completions ADD COLUMN bonus_applique BOOLEAN NOT NULL DEFAULT FALSE;
