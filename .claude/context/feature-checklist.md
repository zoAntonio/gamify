# Validation d'une fonctionnalité — Gamify

Ce fichier est le **portail de sortie** d'une fonctionnalité : avant d'annoncer à
l'utilisateur qu'un ticket/une fonctionnalité est terminé, on passe par cette
checklist. Deux objectifs :
1. Vérifier que le code respecte les conventions du projet.
2. Mettre à jour `.claude/context/roadmap.md` (et `CLAUDE.md` si besoin) pour
   qu'une future session sache exactement ce qui est fait et dans quel état.

**Quand l'utiliser** : à la fin de l'implémentation de toute fonctionnalité ou
ticket du backlog (`G0-T01`, `G1-T04`...), côté backend, frontend, ou les deux —
avant de dire "c'est fait".

## Étape 1 — Identifier le périmètre touché
- Backend seul / frontend seul / les deux ?
- Quel(s) ticket(s) de [roadmap.md](roadmap.md) cette fonctionnalité couvre-t-elle ?

## Étape 2 — Vérifications mécaniques (non négociables)

**Backend** :
- `mvnw compile` (et `mvnw test` s'il y a des tests) → 0 erreur.
- Nouvelle migration Flyway ajoutée si des entités ont changé — jamais une
  migration existante modifiée.

**Frontend** :
- `tsc -b` (ou `npm run build`) → 0 erreur TypeScript.
- `oxlint` → 0 warning non justifié.
- `vitest` si des tests existent → doivent passer.

Si une commande échoue → **pas terminé**, on corrige avant de continuer aux
étapes suivantes.

## Étape 3 — Grille de convention (P0 puis P1)

Relire la section 11 (grille de revue) du document de convention concerné :
- Backend → [backend-java-spring.md](../conventions/backend-java-spring.md) section 11.
- Frontend → [frontend-react-typescript.md](../conventions/frontend-react-typescript.md) section 11.

Un seul point **P0** présent = la fonctionnalité n'est **pas validée**, on
corrige avant de continuer. Les points **P1** sont à corriger si raisonnable ;
sinon les noter explicitement comme dette technique à l'étape 6 plutôt que de
les passer sous silence.

## Étape 4 — Respect de la recette (méthode)

Vérifier que l'ordre décrit dans le guide de méthode correspondant a bien été
suivi (l'ordre évite les allers-retours, pas seulement le résultat final) :
- Backend → [backend-workflow.md](backend-workflow.md).
- Frontend → [frontend-workflow.md](frontend-workflow.md), en particulier la
  règle feature-first : rien de spécifique à la feature ne doit traîner dans un
  dossier global (`src/hooks/`, `src/services/`...).

## Étape 5 — Vérification fonctionnelle réelle

Un test qui passe ou un `tsc` propre ne prouvent pas que ça marche pour
l'utilisateur. Dérouler concrètement le scénario ajouté avant de conclure :
- Utiliser le skill `verify` (ou `run` pour lancer l'app) plutôt que de se fier
  uniquement aux types/tests.
- Backend : requête HTTP réelle sur l'endpoint (curl/Postman), vérifier le code
  HTTP et le corps `ApiResponse` retournés.
- Frontend : parcours réel dans le navigateur (chemin nominal + un cas d'erreur).

## Étape 6 — Mettre à jour le contexte

Une fois les étapes 1 à 5 passées sans point bloquant :
1. Dans [roadmap.md](roadmap.md), section **"Suivi d'avancement"** : marquer le
   ticket concerné comme fait, avec la date et une note courte sur les écarts
   éventuels (dette technique introduite, décision différente du critère
   d'acceptation d'origine, P1 volontairement laissé de côté...).
2. Si un nouveau point de dette technique apparaît (P1 non corrigé, TODO
   identifié en cours de route), l'ajouter à la section "Dette technique connue"
   de `roadmap.md`.
3. Si la fonctionnalité fait évoluer l'état général du projet (nouvelle
   dépendance installée, nouveau pattern établi, structure qui change) → mettre
   aussi à jour la section "État actuel du code" de
   [CLAUDE.md](../../CLAUDE.md) si c'est significatif pour les prochaines
   sessions.

## Ce que ce fichier ne remplace pas

- Une revue de code approfondie (`/code-review`) si l'utilisateur la demande
  explicitement pour un changement conséquent.
- La confirmation utilisateur avant toute action destructive (déjà couverte par
  les règles générales de collaboration, indépendamment de cette checklist).
