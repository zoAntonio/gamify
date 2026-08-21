-- Photo preuve à la validation d'une activité (G2-T16, domain.md) : chemin relatif
-- sous uploads/ (ex. activity-proofs/uuid.jpg), servi sur /uploads/** comme l'avatar
-- (V7__avatar_image.sql). Sa présence déclenche le bonus +2 (au lieu de +1) sur
-- l'attribut ciblé à la validation.
ALTER TABLE activities ADD COLUMN photo_preuve VARCHAR(255);
