-- G2-T17 : dimension sociale multi-utilisateurs (classement, fil d'activité).
-- Réglage de visibilité du profil, opt-in explicite — désactivé par défaut :
-- tant que l'utilisateur ne l'active pas lui-même, son profil n'apparaît dans
-- aucun classement public ni dans le fil d'activité (réflexion vie privée du
-- ticket, même esprit que les booléens de notification de V20 mais inversé :
-- ici le défaut sûr est "rien n'est exposé").
ALTER TABLE user_profiles
    ADD COLUMN profil_public BOOLEAN NOT NULL DEFAULT FALSE;
