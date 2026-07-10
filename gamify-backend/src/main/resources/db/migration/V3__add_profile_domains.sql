-- Profil : avatar + domaines personnalisables/trackés (G0-T02)

ALTER TABLE users ADD COLUMN avatar VARCHAR(30);

CREATE TABLE domaines (
    id               BIGSERIAL PRIMARY KEY,
    nom              VARCHAR(255) NOT NULL,
    cree_par_user_id BIGINT REFERENCES users (id),
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE domaine_attributs (
    domaine_id BIGINT NOT NULL REFERENCES domaines (id) ON DELETE CASCADE,
    attribut   VARCHAR(20) NOT NULL
);

CREATE TABLE user_tracked_domains (
    user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    domaine_id BIGINT NOT NULL REFERENCES domaines (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, domaine_id)
);

-- Domaines système suggérés (cree_par_user_id NULL = visibles par tous)
INSERT INTO domaines (nom, cree_par_user_id) VALUES
    ('Maths', NULL),
    ('Sport', NULL),
    ('Langues', NULL),
    ('Programmation', NULL),
    ('Musique', NULL);

INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'INT' FROM domaines WHERE nom = 'Maths';

INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'FOR' FROM domaines WHERE nom = 'Sport';
INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'VIT' FROM domaines WHERE nom = 'Sport';

INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'INT' FROM domaines WHERE nom = 'Langues';
INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'CHA' FROM domaines WHERE nom = 'Langues';

INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'INT' FROM domaines WHERE nom = 'Programmation';

INSERT INTO domaine_attributs (domaine_id, attribut)
SELECT id, 'CHA' FROM domaines WHERE nom = 'Musique';
