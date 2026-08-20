-- Suppression logique d'une habitude (même patron que domaines.actif, V10) :
-- HabitCompletion est déjà append-only (V8), une suppression physique de habits
-- casserait cet historique et les badges déjà débloqués via cette habitude.
ALTER TABLE habits ADD COLUMN actif BOOLEAN NOT NULL DEFAULT TRUE;
