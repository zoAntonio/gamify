-- Rôle admin persisté sur users (credentials) au lieu d'être recalculé à
-- chaque login par correspondance d'email (gamify.admin.email, voir ancien
-- AuthService/UserDetailsServiceImpl). 'admin@admin.com' est la même valeur
-- que gamify.admin.email (application.properties) et que l'email du compte
-- de test seedé en V14 — hardcodée ici comme V14 le fait déjà pour ce même
-- email, décision explicite utilisateur (pas de mécanisme de promotion
-- dédié pour l'instant : à revoir si un jour il faut plusieurs admins).

ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET is_admin = TRUE WHERE email = 'admin@admin.com';
