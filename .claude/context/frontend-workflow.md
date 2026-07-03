# Méthode de développement frontend — Gamify

Ce fichier décrit **l'ordre et la manière** d'ajouter une fonctionnalité côté
`gamify-frontend`, sur le même principe que
[.claude/context/backend-workflow.md](backend-workflow.md) côté backend. Voir
[.claude/CLAUDE.md](../../CLAUDE.md) pour le contexte général et
[.claude/conventions/frontend-react-typescript.md](../conventions/frontend-react-typescript.md)
pour le détail des règles de style. Ce fichier est le "comment on procède",
l'autre est le "quelles sont les règles".

**Avant de commencer une fonctionnalité, lis ce fichier.**

## Règle fondamentale — développement feature-first

**On développe par feature, pas par couche technique.** Tout ce qui concerne une
fonctionnalité donnée — ses composants, ses hooks, son service d'appel API, son
store, ses types — vit **ensemble** dans un seul dossier
`features/<feature>/`, et nulle part ailleurs :

```
features/tasks/
├─ components/   TaskCard.tsx, TaskList.tsx...
├─ hooks/         useTasks.ts, useCompleteTask.ts...
├─ services/      taskService.ts
├─ store/         useTaskStore.ts (si état global propre à la feature)
└─ types/         task.types.ts
```

Concrètement :
- On ne crée **pas** un dossier générique `hooks/`, `services/` ou `components/`
  à la racine de `src/` pour y ranger du code propre à une fonctionnalité
  précise. Ces dossiers globaux (`src/hooks/`, `src/services/`, `src/store/`,
  `src/types/`) sont réservés à ce qui est **réellement transverse** à toute
  l'application (ex. client HTTP partagé, `AuthContext`, thème).
- `components/ui/` ne contient que des atomes génériques sans connaissance du
  métier (`Button`, `Badge`, `Modal`) — jamais un composant qui connaît
  `Task`, `Activity` ou un attribut RPG.
- Avant d'ajouter un fichier, se demander : *"si je supprime cette feature
  entière, ce fichier doit-il partir avec elle ?"* Si oui → il est dans
  `features/<feature>/`. Si non (utile à plusieurs features) → il est dans un
  dossier global.
- Une feature peut dépendre de `components/ui/`, `lib/`, `types/` globaux —
  jamais l'inverse (le global ne dépend jamais d'une feature).

Cette règle prime sur toute tentation de "factoriser trop tôt" entre deux
features qui se ressemblent un peu : dupliquer un petit hook entre `tasks/` et
`agenda/` est préférable à créer une dépendance croisée entre deux features
avant d'être sûr que l'abstraction commune est la bonne.

## État actuel — à savoir avant de commencer

Le frontend est encore le **squelette Vite par défaut** (`App.tsx`/`main.tsx` de
démo, `react` + `react-dom` seuls dans `package.json`). Rien n'est encore
installé : pas de React Router, pas de Zustand, pas de TanStack Query, pas de
Tailwind. La structure `src/features/` cible (voir doc de convention, section 2)
n'existe pas non plus.

**Ne rien installer par anticipation.** On installe une dépendance seulement au
moment où la fonctionnalité qu'on écrit en a réellement besoin (YAGNI) :
- Premier écran avec plusieurs pages → `react-router-dom`.
- Premier appel API avec besoin de cache/refetch → `@tanstack/react-query`.
- Premier état global partagé entre plusieurs écrans (attributs RPG,
  notifications) → `zustand`.
- Premier composant stylé au-delà de CSS basique → `tailwindcss`.

## Rappel de la structure cible (feature-first)

```
src/
├─ components/ui/      composants génériques réutilisables, zéro logique métier
├─ features/<feature>/ components/ hooks/ services/ store/ types/
├─ pages/               assemblage des features en écrans, branché au router
├─ router/               config React Router
├─ lib/                  config des libs (queryClient...)
├─ store/                stores globaux transverses (pas spécifiques à une feature)
└─ types/                types globaux partagés (ex. AttributeType commun à tout le jeu)
```

## Recette pour ajouter une fonctionnalité (ex. "Auth", "Tâches/Kanban"...)

### 1. Types d'abord — le contrat avant l'UI
- Définir les types/interfaces métier dans `features/<feature>/types/` avant
  d'écrire le moindre composant (ex. `Task`, `TaskStatus`). C'est l'équivalent
  frontend du "domain-first" backend : le contrat de données précède l'affichage.
- Les types doivent refléter ce que l'API backend renvoie réellement dans
  `data` de l'enveloppe `ApiResponse<T>` (voir `backend-workflow.md`) — vérifier
  le DTO `Response` correspondant côté backend plutôt que de deviner la forme.

### 2. Service layer — jamais de fetch direct dans un composant
- `features/<feature>/services/xxxService.ts` : fonctions typées qui appellent
  l'API, déballent `ApiResponse<T>.data`, et propagent une erreur exploitable si
  `success: false`.
- Un seul endroit par ressource qui connaît l'URL/le verbe HTTP — jamais un
  `fetch`/`axios` inline dans un composant ou un hook métier.

### 3. State — choisir le bon outil selon la portée
Voir le tableau de décision dans le doc de convention (section 6.1). Pour Gamify
concrètement :
- **TanStack Query** pour toute donnée qui vient du backend (tâches, profil,
  leaderboard) — c'est le cas le plus fréquent.
- **Zustand** pour l'état global fréquemment modifié et partagé entre écrans
  (attributs RPG, notifications non lues).
- **useState/useReducer** pour l'état UI purement local à un composant.
- Le hook custom qui expose cet état vit dans `features/<feature>/hooks/`
  (`useTasks`, `useCompleteTask`...), jamais l'appel API directement dans le
  composant.

### 4. Composants — UI pure, typée, sans logique inline
- `features/<feature>/components/` pour les composants propres à la
  fonctionnalité ; `components/ui/` seulement pour du générique réutilisable
  ailleurs (Button, Badge...).
- Props toujours typées (interface dédiée, jamais `any`). Composant < 150 lignes
  JSX sinon découper. Pas de logique inline dans le JSX (extraire en variable/
  hook). Early return pour `isLoading`/`isError`/vide, avant le JSX principal.
- Export named (jamais `default`, sauf le composant de page monté sur une route).

### 5. Page — assembler la fonctionnalité, brancher le router
- `pages/` assemble les composants de la feature en écran complet, gère les
  early returns de haut niveau, et est celui qu'on référence dans
  `router/`.

### 6. Style
- Tailwind CSS pour tout nouveau composant (à installer au premier besoin réel,
  voir plus haut). Variables CSS pour les couleurs d'attributs
  (`--color-int`, `--color-for`...) — ne pas coder une couleur en dur dans
  plusieurs composants.

### 7. Tests
- Vitest + Testing Library (à installer au premier besoin). Un test de hook
  (comportement) et un test de composant (rendu + interaction clé), nommage
  `methodName_scenario_expected` — même convention que le backend.

### 8. Avant de considérer la fonctionnalité terminée
- Relire la grille de revue P0/P1 dans
  [frontend-react-typescript.md](../conventions/frontend-react-typescript.md)
  (section 11).
- `tsc` sans erreur, `oxlint` sans warning oublié.
- Tester le parcours dans le navigateur (pas seulement les types/tests) avant de
  dire que c'est fini.

## Premier chantier à faire (pas encore de patron existant)

Contrairement au backend où le flux `auth` sert déjà de patron concret
bout-en-bout, **le frontend n'a encore aucune fonctionnalité réelle** — la page
de connexion/inscription (G0-T01, voir `roadmap.md`) sera le premier exemple
complet à construire, et servira ensuite de référence à copier pour les
fonctionnalités suivantes (comme `auth` l'a fait côté backend).
