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

Il y a en plus, pour chaque côté, un guide de **méthode** (l'ordre des étapes pour
ajouter une fonctionnalité) — à lire avant de commencer toute nouvelle
fonctionnalité, en complément des règles de style ci-dessus :

- Backend → [.claude/context/backend-workflow.md](.claude/context/backend-workflow.md)
  (s'appuie sur le socle déjà en place : `BaseEntity`, exceptions, `ApiResponse`...).
- Frontend → [.claude/context/frontend-workflow.md](.claude/context/frontend-workflow.md)
  (le frontend est encore un squelette Vite par défaut, rien n'y est encore installé).

**Avant de dire qu'une fonctionnalité est terminée**, passer par
[.claude/context/feature-checklist.md](.claude/context/feature-checklist.md) — le
portail de sortie qui vérifie les conventions (P0/P1) et met à jour
`.claude/context/roadmap.md` (section "Suivi d'avancement"). Ne pas sauter cette
étape même pour un changement qui semble petit.
Points non négociables (grille de revue P0, cf. documents) :
- Clean Architecture respectée (pas de repository/EntityManager dans un controller).
- Pas de `System.out.println` / `console.log` oublié → SLF4J / rien.
- Pas de `any` TypeScript non justifié, pas de secret hardcodé.
- Toute liste paginée côté API (`Page<T>`), toute entrée validée (`@Valid`).
- Composants React < 150 lignes JSX, services Java < 300 lignes / méthodes < 30 lignes.

## État actuel du code (à connaître avant de modifier)

- Le backend suit la structure en couches cible
  (`domain/application/infrastructure/presentation`, voir
  [.claude/context/backend-workflow.md](.claude/context/backend-workflow.md) pour
  la recette détaillée d'ajout de fonctionnalité). Le socle est en place :
  `BaseEntity`, hiérarchie d'exceptions domain, `ApiResponse<T>`,
  `GlobalExceptionHandler`, `JpaConfig`. Le filtre JWT est maintenant fonctionnel
  (`JwtAuthFilter` + `UserDetailsServiceImpl` + `JsonAuthenticationEntryPoint` pour
  un vrai 401 JSON) — les endpoints protégés marchent réellement (vérifié via
  `GET /api/profile`). Les flux `auth` et `profile`/`domaines` (G0-T01/G0-T02) sont
  les patrons bout-en-bout à suivre pour les prochaines fonctionnalités
  (Activités/Kanban, Progression, Badges...).
- Le frontend a sa première fonctionnalité réelle : `react-router-dom` + `zustand`
  installés, alias `@/` configuré (tsconfig + vite.config), mode TypeScript strict
  activé. Structure feature-first amorcée (`features/auth/`, `features/profile/`),
  état d'auth global dans `src/store/useAuthStore.ts` (transverse, pas dans une
  feature — voir règle dans
  [frontend-workflow.md](.claude/context/frontend-workflow.md)). Toujours pas de
  TanStack Query/Tailwind (pas encore de besoin réel).
- **Dette connue après G0-T01/G0-T02** (détail dans
  [.claude/context/roadmap.md](.claude/context/roadmap.md)) : `GET /api/domaines`
  non paginé (accepté, liste petite par nature), aucun test écrit backend/frontend
  sur cette feature, parcours frontend non vérifié par clic réel en navigateur
  (pas d'outil d'automatisation navigateur dans cet environnement — vérifié
  seulement via compilation/service Vite sans erreur).
- Aucun test n'existe encore (ni JUnit côté backend, ni Vitest côté frontend).

Signaler si un ticket touche du code existant non conforme, pour décider au cas
par cas de le remettre aux normes.

## Rappels de collaboration

- Documents sources bruts (PDF) dans `docs/` — ne pas les régénérer, ce sont les
  fichiers `.claude/` qui en sont la version condensée exploitable.
- Toujours créer une nouvelle migration Flyway plutôt que d'éditer une existante.
- Demander avant toute action destructive (reset DB, force-push, suppression de
  migration déjà appliquée en environnement partagé).
