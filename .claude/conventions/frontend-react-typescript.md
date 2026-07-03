# Conventions React / TypeScript — Gamify

Condensé de `docs/Convention_React_TypeScript.pdf` (v1.0, 2026). Référence complète
dans le PDF si un détail manque ici. Portée doc d'origine : React 18+ (le repo réel
utilise React 19, mêmes règles), TypeScript 5+, Vite. Le repo utilise **oxlint**, pas
ESLint — adapter les commandes de lint en conséquence.

## 1. Nommage

| Élément | Convention | Exemple correct | Exemple incorrect |
|---|---|---|---|
| Composant React | PascalCase | `UserCard`, `OrderList` | `userCard`, `order-list` |
| Fichier composant | `PascalCase.tsx` | `UserCard.tsx` | `userCard.tsx`, `user-card.tsx` |
| Hook custom | `use` + camelCase | `useOrderData`, `useAuth` | `OrderData`, `getAuth` |
| Fonction utilitaire | camelCase verbe+nom | `formatCurrency()` | `FormatCurrency()` |
| Constante | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` | `maxRetryCount` |
| Interface TS | PascalCase **sans** `I` | `OrderProps`, `UserDto` | `IOrderProps`, `iUser` |
| Type TS | PascalCase | `OrderStatus` | `orderStatus` |
| Enum | PascalCase (membres inclus) | `OrderStatus.Pending` | `ORDER_STATUS.PENDING` |
| Context | PascalCase + `Context` | `AuthContext` | `authCtx` |
| Store (Zustand) | camelCase + `Store` | `useOrderStore` | `orderState` |
| Fichier test | `NomComposant.test.tsx` | `UserCard.test.tsx` | `userCardSpec.js` |
| Dossier | kebab-case | `user-profile/` | `UserProfile/` |
| Variable locale | camelCase | `isLoading` | `IsLoading`, `has_error` |

Jamais : composant en `.js` (toujours `.tsx`), variable à une lettre (sauf `i` dans
un `.map`), préfixe `I` sur les interfaces (convention C#, pas React), noms
génériques seuls (`Handler`, `Manager`, `Data`).

## 2. Structure du projet (feature-first)

```
src/
├─ assets/         ← images, fonts, icônes statiques
├─ components/     ← UI générique réutilisable, aucune logique métier
│  ├─ ui/          ← atoms : Button, Input, Badge, Modal
│  └─ shared/      ← molecules réutilisables
├─ features/       ← fonctionnalités métier
│  ├─ auth/        ├─ components/ hooks/ services/ store/ types/
│  ├─ tasks/        (tâches/kanban Gamify)
│  ├─ avatar/        (avatar + stats Gamify)
│  └─ agenda/        (agenda + habitudes Gamify)
├─ hooks/          ← hooks globaux partagés
├─ lib/            ← config libs (queryClient, supabase...)
├─ pages/          ← pages / routes
├─ router/         ← config React Router
├─ services/       ← services API globaux
├─ store/          ← stores globaux (Zustand)
├─ types/          ← types globaux partagés
└─ utils/          ← fonctions utilitaires pures
```

Règle feature-first : tout ce qui concerne une fonctionnalité (composants, hooks,
services, types) vit dans son dossier `features/`. `components/` ne contient que de
l'UI générique. Voir "État actuel" dans `CLAUDE.md` racine — cette structure n'est
pas encore en place, le repo est le squelette Vite par défaut.

## 3. Composants React

Structure standard : imports groupés → interface Props (toujours typée, jamais
`any`) → composant en **export named** (jamais `default`, sauf pages/routes) →
hooks en premier → handlers → early return (`isLoading`) → JSX (1 niveau
d'indentation max dans le `return`).

Règles : un composant = une responsabilité (SRP), < 150 lignes JSX (sinon extraire
des sous-composants), props typées obligatoirement, pas de logique inline dans le
JSX (extraire dans une variable/un hook), pas de side effect hors `useEffect`/handler,
un fichier = un composant (sauf sous-composants privés minuscules).

## 4. TypeScript strict

`tsconfig.json` doit avoir : `strict: true`, `noImplicitAny`, `strictNullChecks`,
`noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`,
`noUncheckedIndexedAccess`, alias `@/*` → `src/*`.

Jamais `any` (utiliser un union type précis), jamais `object`/`any` comme type de
propriété, jamais de type assertion non sécurisée (`as User` sans garde), toujours
typer les paramètres/retour de fonction. Types utilitaires à privilégier : `Partial`,
`Required`, `Pick`, `Omit`, `Record`, `Readonly`, `ReturnType`, `NonNullable`.

## 5. Hooks

Règles fondamentales : appel uniquement au top level (jamais dans une condition/
boucle), uniquement dans un composant/hook, préfixe `use` obligatoire, un hook = une
responsabilité, dépendances `useEffect` **exhaustives** (jamais désactivées
manuellement), ne pas abuser de `useCallback`/`useMemo` (profiler avant
d'optimiser), retourner un objet nommé (`{ data, isLoading, error }`) plutôt qu'un
tableau positionnel.

`useEffect` : toujours un cleanup si abonnement/timer/flag d'annulation pour éviter
un `setState` après unmount ; ne jamais faire un `setState` inconditionnel sur une
dépendance qui inclut cette même valeur (boucle infinie).

## 6. State management — quel outil pour quel besoin

| Solution | Usage | Exemple Gamify |
|---|---|---|
| `useState` local | État UI local au composant | `isOpen`, `isExpanded` |
| `useReducer` | État local complexe, plusieurs transitions | formulaire multi-étapes |
| Context API | État global léger, rarement mis à jour | thème, langue, user connecté |
| Zustand | État global fréquemment mis à jour | attributs RPG, notifications |
| TanStack Query | Cache serveur, données async | tâches, profil, leaderboard |
| URL / query params | État partageable par URL | filtres, pagination, onglet actif |

Zustand : `create<State>()(devtools(persist((set, get) => ({...}), { name })))`.
Toujours un plancher explicite sur les valeurs qui ne doivent jamais être négatives
(`Math.max(0, ...)`) — directement pertinent pour les attributs RPG Gamify.

TanStack Query : `queryKey` unique par ressource+params, `staleTime` explicite,
`enabled` pour éviter un fetch avec paramètre vide ; invalider le cache
(`invalidateQueries`) `onSuccess` d'une mutation plutôt que de mettre à jour l'état
à la main.

## 7. Performance

Ne pas mémoïser un calcul trivial (`useMemo` sur une addition = bruit). Mémoïser un
calcul réellement coûteux (agrégation pour un radar chart). `useCallback` seulement
si la fonction est passée à un enfant mémoïsé (`React.memo`). Profiler (React
DevTools Profiler) avant d'optimiser, jamais par réflexe.

`lazy` + `Suspense` pour le code splitting par route et les composants lourds
(charts, cartes). Virtualisation (TanStack Virtual/react-window) pour les longues
listes. Debounce/throttle sur recherche/resize/scroll.

## 8. Appels API

**Jamais** de `fetch`/appel direct dans un composant. Toujours un service layer
(`services/xxxService.ts`) typé, consommé depuis un hook custom ou TanStack Query —
jamais directement dans le composant. Le composant gère seulement les early returns
`isLoading`/`isError`/`empty`.

## 9. CSS

Tailwind CSS recommandé (utilitaire-first). CSS Modules acceptable. CSS-in-JS
runtime à éviter pour les animations fréquentes. Style inline (`style={{}}`) à
éviter (pas de pseudo-classes/responsive). Règle Gamify : variables CSS pour les
couleurs d'attributs (`--color-int`, `--color-for`...) pour permettre un reskin en
Phase 2.

## 10. Tests

Répartition cible : 60% unitaires (Vitest + Testing Library) sur hooks/utils/
services/stores, 30% composants (rendu + interactions), 10% E2E (Playwright/
Cypress). Nommage `methodName_scenario_expected` (même convention que le backend).

## 11. Grille de revue — sévérités

**P0 (bloquant)** : composant en `.js`, `any` non justifié, fetch direct dans un
composant, mutation directe d'un état global (Zustand/Redux) sans setter,
`useEffect` avec dépendances désactivées manuellement, secret/token exposé côté
frontend, composant > 200 lignes, mutation sans gestion d'erreur (`onError`
absent), `dangerouslySetInnerHTML` sur donnée utilisateur non sanitisée.

**P1 (sous 24h)** : props non typées, `console.log` oublié, pas de test sur un hook
métier critique, fuite mémoire (listener/interval sans cleanup), `key={index}` sur
liste mutable, mémo ajouté sans mesure de perf préalable, import relatif profond
(`../../../../`) au lieu de l'alias `@/`, mutation sans `isLoading`.

Checklist avant PR : 0 erreur `tsc`, nommage conforme, composants < 150 lignes/props
typées/export named, dépendances `useEffect` exhaustives + cleanup, bon outil de
state selon la portée, appels via service layer, pas de mémo prématuré, tests
hooks+interactions clés, Tailwind/CSS Modules, pas de secret frontend, 0
`console.log`, alias `@/` utilisés, accessibilité (aria-label, rôles), pas de
duplication > 10 lignes.
