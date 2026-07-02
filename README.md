# Gamify

Gamify your own life — une application qui gamifie le développement personnel :
statistiques RPG, progression et attributs qui évoluent (et se dégradent) dans le temps.

## Structure du monorepo

- `gamify-backend/` — API Spring Boot (Java 17, PostgreSQL, JWT, migrations Flyway).
- `gamify-frontend/` — application web React (Vite + TypeScript). Empaquetage mobile
  (APK Android) prévu plus tard via [Capacitor](https://capacitorjs.com/).
- `scripts/` — scripts de développement (base de données, lancement backend/frontend).

## Lancer le projet en développement

Prérequis : JDK 17+, Node.js 18+, PostgreSQL installé et démarré en local.

```powershell
./scripts/dev.ps1
```

Ce script ouvre deux fenêtres de terminal :

- **Backend** : prépare la base de données (rôle + base, voir plus bas), puis lance
  `mvnw spring-boot:run` (http://localhost:8081). Les tables sont créées/ajustées
  automatiquement par **Flyway** au démarrage, à partir des migrations versionnées
  dans `gamify-backend/src/main/resources/db/migration`.
- **Frontend** : `npm run dev` dans `gamify-frontend/` (http://localhost:5173).

```powershell
./scripts/dev.ps1 -SkipDbSetup              # sauter la préparation de la base (déjà prête)
```

### Base de données

`scripts/setup-db.ps1` crée (si besoin) le rôle `gamify_user` et la base `gamify_db`
utilisés par le backend (voir `gamify-backend/src/main/resources/application.properties`).
Il est idempotent : le relancer sur une base déjà prête ne fait rien. Il te
demandera le mot de passe du super-utilisateur `postgres` de façon interactive.

```powershell
./scripts/setup-db.ps1
```

Ce script ne gère **que** le rôle et la base — pas les tables. Les tables sont
entièrement gérées par les migrations Flyway (`db/migration/V*.sql`), appliquées
automatiquement à chaque démarrage du backend. Pour ajouter une évolution de
schéma, crée un nouveau fichier `V2__description.sql`, etc. dans ce dossier.

### Lancer les projets séparément

```powershell
./scripts/run-backend.ps1          # prépare la DB puis lance le backend
./scripts/run-frontend.ps1         # lance le frontend (npm run dev)
```
