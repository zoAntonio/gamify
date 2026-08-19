-- Badges (domain.md) : 3 paliers par domaine (Bronze/Argent/Or), catalogue géré
-- par l'admin (badge_definitions), déblocages historisés par saison (user_badges,
-- append-only, jamais supprimé/modifié une fois obtenu — un même badge peut être
-- regagné à chaque nouvelle saison, d'où saison_id dans la clé d'unicité).
CREATE TABLE badge_definitions (
    id BIGSERIAL PRIMARY KEY,
    domaine_id BIGINT NOT NULL REFERENCES domaines (id),
    palier VARCHAR(10) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    seuil_validations INT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_badge_definitions_palier CHECK (palier IN ('BRONZE', 'ARGENT', 'OR')),
    CONSTRAINT chk_badge_definitions_seuil CHECK (seuil_validations > 0),
    CONSTRAINT uq_badge_definitions_domaine_palier UNIQUE (domaine_id, palier)
);

CREATE INDEX idx_badge_definitions_domaine ON badge_definitions (domaine_id);

CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    badge_definition_id BIGINT NOT NULL REFERENCES badge_definitions (id),
    saison_id BIGINT NOT NULL REFERENCES saisons (id),
    date_obtention TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_badges_user_badge_saison UNIQUE (user_id, badge_definition_id, saison_id)
);

CREATE INDEX idx_user_badges_user ON user_badges (user_id);
CREATE INDEX idx_user_badges_badge_definition ON user_badges (badge_definition_id);
CREATE INDEX idx_user_badges_saison ON user_badges (saison_id);
