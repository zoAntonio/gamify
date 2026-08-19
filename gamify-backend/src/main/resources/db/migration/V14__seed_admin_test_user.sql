-- Compte admin de test pour faciliter la vérification manuelle du backoffice en
-- local (demande explicite utilisateur). Login = email (voir AuthService/LoginRequest),
-- pas le username : se connecter avec admin@admin.com / admin.
-- Mot de passe "admin" — hash BCrypt généré hors-ligne (BCryptPasswordEncoder, la
-- même classe que SecurityConfig.passwordEncoder()), jamais en clair en base.
-- Recette locale uniquement, jamais un pattern à reproduire en environnement partagé.
--
-- Les colonnes non listées (attributs RPG, xp_total, niveau, titre) prennent leurs
-- valeurs par défaut en base (10/0/1/'Novice', V4), identiques à un compte créé via
-- /api/auth/register.
INSERT INTO users (username, email, password, created_at, updated_at)
VALUES (
    'admin',
    'admin@admin.com',
    '$2a$10$LCtk72MzT8hgOTNr4n82xeGiheTGbnPYVVPjZaRgQ8WYotO1y4eiS',
    now(),
    now()
);
