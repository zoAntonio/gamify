-- Ajout du suivi d'audit (BaseEntity : createdAt/updatedAt) sur les entités mutables.
-- progression_logs n'est pas concerné : c'est un log append-only (déjà horodaté par "date").

ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE activities ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
