# Gamify — Contexte projet pour Claude Code

Lis ce fichier avant toute tâche de code sur ce repo. Il renvoie vers les fichiers
détaillés dans `.claude/` — va les consulter quand tu touches la couche concernée.

## C'est quoi Gamify

Application qui gamifie le développement personnel façon Solo Leveling : l'utilisateur
suit des activités réelles (maths, sport, langues...), gagne ou perd des points
d'attributs RPG (INT, FOR, VIT, PRE, CHA, RES), monte de niveau, débloque des badges.
Détail des règles du jeu : [.claude/context/domain.md](.claude/context/domain.md).
Backlog / phases : [.claude/context/roadmap.md](.claude/context/roadmap.md).

## Stack

- **Backend** : `gamify-backend/` — Java 17, Spring Boot 3.2.0, PostgreSQL, Flyway,
  Spring Security + JWT (jjwt), Lombok. Port 8081.
- **Frontend** : `gamify-frontend/` — React 19, TypeScript ~6.0, Vite 8, oxlint
  (pas ESLint). Port 5173. Empaquetage mobile Android prévu plus tard via Capacitor.
- **BDD** : PostgreSQL, schéma géré **exclusivement** par migrations Flyway
  (`gamify-backend/src/main/resources/db/migration/V*.sql`).
- Scripts de lancement : `scripts/dev.ps1`, `scripts/setup-db.ps1` (voir README.md).

## Méthodologie de développement — règle fondamentale

**On ne conçoit jamais la base de données à la main en premier.** Le développement est
orienté objet : on modélise le domaine avec des entités Java (JPA), et le schéma SQL
est une conséquence, pas un point de départ.

Concrètement, pour toute évolution de données :
1. Modifier/créer les entités JPA (Domain) et leur logique métier.
2. Traduire ce changement dans une nouvelle migration Flyway `V{n}__description.sql`
   dans `db/migration/`. **Ne jamais modifier une migration déjà appliquée** — toujours
   en ajouter une nouvelle.
3. `spring.jpa.hibernate.ddl-auto=validate` (déjà configuré) : Hibernate vérifie que les
   entités correspondent au schéma réel, il ne le génère jamais. Si validate échoue,
   c'est la migration qu'il faut corriger/compléter, pas relâcher la validation.

En clair : les entités Java sont la source de vérité conceptuelle, les migrations
Flyway sont la source de vérité physique versionnée. Les deux doivent rester en phase.

## Conventions de code — obligatoires

Les règles complètes (nommage, architecture, patterns, tests, sécurité, grille de
revue) sont dans deux documents de référence issus de `docs/` :

- Backend Java/Spring Boot → [.claude/conventions/backend-java-spring.md](.claude/conventions/backend-java-spring.md)
- Frontend React/TypeScript → [.claude/conventions/frontend-react-typescript.md](.claude/conventions/frontend-react-typescript.md)

Lis le fichier concerné avant d'écrire du code dans la couche correspondante.
Points non négociables (grille de revue P0, cf. documents) :
- Clean Architecture respectée (pas de repository/EntityManager dans un controller).
- Pas de `System.out.println` / `console.log` oublié → SLF4J / rien.
- Pas de `any` TypeScript non justifié, pas de secret hardcodé.
- Toute liste paginée côté API (`Page<T>`), toute entrée validée (`@Valid`).
- Composants React < 150 lignes JSX, services Java < 300 lignes / méthodes < 30 lignes.

## État actuel du code (à connaître avant de modifier)

Le repo est un **socle initial**, pas encore aligné sur la Clean Architecture cible :
- Le backend a des packages par feature (`com.gamify.user`, `com.gamify.activity`,
  `com.gamify.auth`, `com.gamify.progression`, `com.gamify.config`) mais pas encore la
  séparation `domain/application/infrastructure/presentation` du document de
  convention. Pas de DTOs, pas de mappers, entités avec `@Data` Lombok exposées
  directement (`AuthController`, `AuthService`).
- Le frontend est le squelette Vite par défaut (pas encore de structure
  `features/`, pas de Zustand/TanStack Query/Tailwind installés).
- Aucun test n'existe encore (ni JUnit côté backend, ni Vitest côté frontend).

Ne pas bloquer sur cet écart : les nouvelles fonctionnalités doivent suivre les
conventions cible dès maintenant (nouveaux packages/dossiers propres), sans qu'un
refactor global soit exigé sauf demande explicite. Signaler si un ticket touche du
code existant non conforme, pour décider au cas par cas de le remettre aux normes.

## Rappels de collaboration

- Documents sources bruts (PDF) dans `docs/` — ne pas les régénérer, ce sont les
  fichiers `.claude/` qui en sont la version condensée exploitable.
- Toujours créer une nouvelle migration Flyway plutôt que d'éditer une existante.
- Demander avant toute action destructive (reset DB, force-push, suppression de
  migration déjà appliquée en environnement partagé).
