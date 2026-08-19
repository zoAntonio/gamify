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
- Scripts de lancement : `scripts/dev.bat` (lance les deux serveurs, sans contrôle)
  ou `scripts/devctl.ps1` (contrôleur interactif : `start`/`stop`/`build`).
  ⚠️ Le README.md référence encore `scripts/dev.ps1`/`scripts/setup-db.ps1` qui
  n'existent plus (dérive non liée au backoffice, pas corrigée ici — à traiter
  séparément).

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
  la recette détaillée d'ajout de fonctionnalité). Socle en place : `BaseEntity`,
  hiérarchie d'exceptions domain, `ApiResponse<T>`, `GlobalExceptionHandler`,
  filtre JWT fonctionnel, Swagger. Features livrées : auth, profil/domaines
  (+ upload de photo d'avatar servie sur `/uploads/**`, public), tâches/kanban
  (`Activity`, statuts + récompenses), habitudes/streaks (`Habit`/`HabitCompletion`),
  agenda (`AgendaEvent`), stats (`ProgressionLog` historisé à chaque gain,
  `/api/stats/progression` + `/api/stats/journal`), niveaux/titres
  (`UserProfile.ajouterXp`, seuils doublants), **backoffice admin** (CRUD domaines
  système, catalogue de badges Bronze/Argent/Or par domaine, saisons —
  fenêtre de comptage des badges, une seule active à la fois —, classement/
  stats utilisateurs en lecture seule ; déblocage auto de badges branché dans
  `ActivityService`/`HabitService`). Migrations jusqu'à **V16**.
- **`User` (credentials) / `UserProfile` (données de jeu) séparés** (V15/V16) :
  `users` ne porte plus que id/username/email/password/is_admin/audit ; tous
  les attributs RPG, xp/niveau/titre, avatar/avatar_image et domaines trackés
  vivent sur `user_profiles`, relation 1-1 à clé partagée (`@MapsId`,
  unidirectionnelle — `User` ne référence pas `UserProfile` en retour). But :
  la table qui porte le mot de passe hashé n'est plus requêtée/modifiée à
  chaque gain de point. `UserProfileRepository` n'a pas de méthode dédiée :
  `findById(user.getId())` suffit (clé partagée). `Activity`/`Habit`/
  `AgendaEvent`/`Domaine.creePar`/`ProgressionLog`/`UserBadge` continuent de
  référencer `User` (ownership/identité, pas des données de jeu).
- Rôle **`ROLE_ADMIN`** : un seul admin, désormais **persisté**
  (`users.is_admin`, V16) — initialisé une seule fois à l'inscription par
  correspondance avec `gamify.admin.email` (`AuthService.register`), plus
  jamais recalculé au login. `UserDetailsServiceImpl` lit `user.isAdmin()`
  directement. Écart volontaire vs l'ancien pattern (recalcul à la volée à
  chaque login, rien en base) : changer `gamify.admin.email` après coup ne
  déplace plus l'admin automatiquement — pas encore de mécanisme de
  promotion dédié si plusieurs admins sont nécessaires un jour.
  `/api/backoffice/**` protégé par `hasRole("ADMIN")`
  (`JsonAccessDeniedHandler` pour un 403 JSON propre).
- Le frontend est en structure feature-first complète : `features/auth`, `profile`,
  `activities` (kanban 3 colonnes drag & drop), `agenda` (vues semaine/jour/mois),
  `habits` (grille type HabitKit), `dashboard` (carte du personnage FIFA-like,
  radar/barres d'attributs SVG faits main, XP par période, journal),
  `backoffice/{domaines,users,saisons,badges}` (pages `/admin/*`, garde de
  route `RequireAdmin`, section "Administration" dans `Sidebar` visible
  seulement si `isAdmin`). UI générique dans `components/ui/` (`Button`,
  `Modal`, `Select`, `TextField`, `Pagination`...), thème Tailwind v4 dans
  `index.css` (tokens couleurs/attributs). `react-router-dom` + `zustand` ;
  toujours pas de TanStack Query (hooks fetch maison par feature).
- Dette courante et écarts assumés : voir la section "Suivi d'avancement" et les
  blocs "Écarts/dette" de [.claude/context/roadmap.md](.claude/context/roadmap.md)
  — c'est la source de vérité, tenue à jour à chaque feature.
- Aucun test automatisé n'existe encore (ni JUnit côté backend, ni Vitest côté
  frontend) ; la vérification se fait par compilation + appels HTTP réels (curl),
  le parcours navigateur restant manuel (pas d'outil d'automatisation ici).

Signaler si un ticket touche du code existant non conforme, pour décider au cas
par cas de le remettre aux normes.

## Rappels de collaboration

- Documents sources bruts (PDF) dans `docs/` — ne pas les régénérer, ce sont les
  fichiers `.claude/` qui en sont la version condensée exploitable.
- Toujours créer une nouvelle migration Flyway plutôt que d'éditer une existante.
- Demander avant toute action destructive (reset DB, force-push, suppression de
  migration déjà appliquée en environnement partagé).
