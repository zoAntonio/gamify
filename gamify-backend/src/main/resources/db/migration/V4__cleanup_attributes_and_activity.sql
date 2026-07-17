-- Nettoyage : attributs User alignés sur l'enum Attribut (INT/FOR/VIT/PRE/CHA/RES),
-- départ à 10 au lieu de 0 (domain.md) — VIT = Vitalité, "vitesse" était un champ
-- orphelin issu du scaffold initial. Et relations propres sur Activity (le scaffold
-- initial datait d'avant Domaine/Attribut et utilisait du texte libre).

ALTER TABLE users DROP COLUMN vitesse;

ALTER TABLE users ALTER COLUMN intelligence SET DEFAULT 10;
ALTER TABLE users ALTER COLUMN force SET DEFAULT 10;
ALTER TABLE users ALTER COLUMN vitalite SET DEFAULT 10;
ALTER TABLE users ALTER COLUMN precision SET DEFAULT 10;
ALTER TABLE users ALTER COLUMN charisme SET DEFAULT 10;
ALTER TABLE users ALTER COLUMN resistance SET DEFAULT 10;

UPDATE users SET
    intelligence = 10,
    force = 10,
    vitalite = 10,
    precision = 10,
    charisme = 10,
    resistance = 10;

ALTER TABLE activities DROP COLUMN domaine;
ALTER TABLE activities ADD COLUMN domaine_id BIGINT REFERENCES domaines (id);
CREATE INDEX idx_activities_domaine_id ON activities (domaine_id);

ALTER TABLE activities ALTER COLUMN attribut_cible TYPE VARCHAR(20);
ALTER TABLE activities ADD CONSTRAINT chk_activities_attribut_cible
    CHECK (attribut_cible IN ('INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES'));
