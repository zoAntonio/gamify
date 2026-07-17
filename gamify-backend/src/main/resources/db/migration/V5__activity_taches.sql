-- Feature "liste de tâches" (G1-T07/G1-T09) : frequence typée + objectif descriptif.

ALTER TABLE activities ALTER COLUMN frequence TYPE VARCHAR(20);
ALTER TABLE activities ADD CONSTRAINT chk_activities_frequence
    CHECK (frequence IN ('QUOTIDIEN', 'HEBDOMADAIRE', 'MENSUEL'));

ALTER TABLE activities ADD COLUMN objectif VARCHAR(255);
