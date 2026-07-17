# Roadmap / Backlog Gamify

Condensé de `docs/Gamify_Sprint_Backlog.pdf` (généré 04/07/2026). Le backlog est
écrit pour une équipe de 6 devs ; en solo, sert surtout de **découpage fonctionnel
et d'ordre de dépendance conseillé**, pas d'allocation réelle de devs.

Charge totale estimée (référence, pas contraignante en solo) : 19 jours-homme.

## Phases

- **Phase 0** — Socle applicatif et authentification
- **Phase 1** — MVP jouable (attributs, tâches/kanban, agenda/habitudes, avatar/animations)
- **Phase 2** — Fonctionnalités avancées (badges, photos preuve, multi-utilisateurs, recette)

## Suivi d'avancement

Tenu à jour via [feature-checklist.md](feature-checklist.md) (étape 6) une fois
qu'un ticket passe la checklist de validation — pas avant.

| Ticket | Statut | Date | Notes |
|---|---|---|---|
| G0-T01 | ✅ Fait | 2026-07-03 | Inscription/connexion (déjà en place depuis le socle) + bouton "Essayer en démo" (register puis fallback login sur 409, pas de compte seedé en base). |
| G0-T02 | ✅ Fait | 2026-07-03 | Avatar (enum + emoji placeholder) + domaines trackés. Domaines rendus **personnalisables** (écart assumé vs "liste prédéfinie" du ticket original — décision utilisateur) : 5 domaines système seedés en migration + création de domaines perso par l'utilisateur. |
| G0-T03 | 🔶 Partiel | 2026-07-10 | Navigation principale faite (`Sidebar`/`AppLayout`, responsive). Vrai tableau de bord (niveau, XP, attributs, résumé du jour, streak, dernier badge) toujours pas fait — `DashboardPlaceholderPage` minimal en attendant. |
| G1-T07 | 🔶 Partiel | 2026-07-10 | Création/validation de tâches (`Activity` + `ActivityService`/`Controller`, CRUD create/list/valider). Gain d'attribut à la validation implémenté en version **minimale** (`User.appliquerGainAttribut` : +1 seulement) — pas de malus/plancher/historisation `ProgressionLog`/recalcul de niveau, volontairement reporté à G1-T04/G1-T05 (décision utilisateur : ne pas développer G1-T04 tout de suite). Pas encore d'animations +1/−2 instantanées (ticket original les mentionne, hors scope ici — vue liste simple, pas de Kanban). |
| G1-T10 | 🔶 Partiel | 2026-07-17 | Agenda 3 vues (semaine/jour/mois) sur `/agenda` : événements libres **ou liés à une tâche** (`AgendaEvent.activity` optionnel), couleur selon règle du ticket (accent violet / vert TERMINE / rouge manqué), ligne "maintenant", clic sur créneau = création préremplie, déplacement par drag & drop HTML5 (granularité 1h) ou édition en modale, suppression avec confirmation. Backend : CRUD `/api/agenda` borné `from`/`to` paginé. Pas encore de récurrence ni resize par poignée. |
| G1-T11 | 🔶 Partiel | 2026-07-17 | Tracker d'habitudes façon HabitKit sur `/habits` : carte par habitude (icône emoji, couleur, bouton ✓ du jour), grille de contributions 12 semaines (84 jours), streak courant + record personnel séparé (`Habit.meilleurStreak`). Check = +1 attribut ciblé + 10 XP, **bonus +10 XP à chaque multiple de 7 jours de série** (domain.md), re-check du jour refusé (409). Reste : notifications (G1-T12), décocher, éditer/supprimer une habitude. |
| G1-T09 | 🔶 Partiel | 2026-07-17 | Vue **kanban** 3 colonnes (À faire / En cours / Terminé) façon Azure DevOps Boards sur `/activities` : cartes avec liseré coloré par attribut, drag & drop HTML5 natif + boutons "Commencer"/"Valider", création via modale (`Modal` générique dans `components/ui/`, hauteur bornée + scroll interne pour le paysage mobile). Responsive : rail horizontal à snap (une colonne ≈ 85% de l'écran) sous `md`, grille 3 colonnes au-dessus ; `viewport-fit=cover` ajouté pour les écrans à encoche. Backend : `PATCH /api/activities/{id}/statut` (EN_COURS libre, TERMINE applique les récompenses, sortie de TERMINE refusée). Toujours **pas d'UI de filtres/tri** ni de ratio réalisé/objectif. |

**Écarts/dette introduits par G0-T01/G0-T02, notés consciemment plutôt que masqués :**
- `GET /api/domaines` retourne une `List<DomaineResponse>` non paginée — accepté
  car la liste (domaines système + domaines perso d'un seul utilisateur) reste
  petite par nature ; à reconsidérer si la création de domaines perso devient
  massive.
- Aucun test écrit (`ProfileService`/`DomaineService` côté backend,
  `useProfile`/`useDomaines` côté frontend) — P1 assumé pour aller vite sur la
  première feature bout-en-bout ; à combler avant d'ajouter beaucoup de logique
  dessus.
- Vérification frontend limitée à : `tsc`/`oxlint` propres + serveur Vite qui
  sert tous les modules sans erreur de résolution (alias `@/`, react-router-dom,
  zustand). Pas de clic réel dans un navigateur (pas d'outil d'automatisation
  navigateur disponible dans cet environnement) — à faire manuellement par
  l'utilisateur via `scripts/dev.ps1` avant de considérer le parcours
  garanti à 100%.

**Écarts/dette introduits par G1-T07/G1-T09 (2026-07-10) :**
- Gain d'attribut minimal (`User.appliquerGainAttribut`) : uniquement +1 à la
  validation, pas de malus −2/−3(PRE), pas de plancher explicite (inutile tant
  qu'il n'y a pas de malus), pas d'écriture dans `ProgressionLog` (existe déjà
  en base mais pas encore branché), pas de recalcul de niveau/titre à partir de
  `xpTotal`. Le tout est le périmètre de G1-T04/G1-T05, volontairement pas
  traité maintenant (décision utilisateur).
- Pas d'UI de filtres/tri sur `/activities` côté frontend (le backend les
  supporte déjà via `ActivityRepository.search` + query params).
- Aucun test écrit (`ActivityService` côté backend, `useActivities` côté
  frontend) — même dette assumée que G0-T01/G0-T02.
- Vérifié en revanche via appels HTTP réels (curl) sur le compte démo : create
  ×6, valider ×3 (+ re-validation refusée), liste paginée cohérente,
  `xpTotal` incrémenté (150 après 3×50) — pas seulement `tsc`/compile.

**Écarts/dette introduits par le kanban G1-T09 (2026-07-17) :**
- Backend vérifié par appels HTTP réels (compte de test jetable) : création,
  A_FAIRE→EN_COURS, EN_COURS→TERMINE (+50 XP constaté sur `/profile`,
  `completedAt` posé), TERMINE→A_FAIRE refusé en 400 "Cette tâche est déjà
  validée". Frontend vérifié seulement via `tsc`/`oxlint`/`vite build` propres —
  toujours pas de clic réel en navigateur (même limite d'environnement
  qu'avant), à tester manuellement via `scripts/dev.ps1` (drag & drop inclus).
- Drag & drop en HTML5 natif (pas de lib) : suffisant desktop, mais **pas de
  support tactile** — les boutons "Commencer"/"Valider" sur les cartes servent
  de fallback mobile en attendant (à revoir pour Capacitor).
- Le board charge `size=100` sans pagination UI (accepté : volumétrie mono-
  utilisateur faible ; à revoir si besoin).
- `ActivityListItem` supprimé (remplacé par `ActivityCard`). Toujours aucun test
  automatisé sur la feature.

**Écarts/dette introduits par G1-T10/G1-T11 (2026-07-17) :**
- Backend vérifié par HTTP réel (compte jetable) : habitude créée → check (+1 INT
  constaté **en base**, +10 XP sur `/profile`), re-check 409, streak 7 obtenu en
  antidatant 6 completions en SQL → bonus +10 XP et record 7 confirmés ; agenda :
  événement libre + lié (couleur suit le statut de la tâche → TERMINE), 400 si
  fin ≤ début, bornage `from`/`to`, déplacement PUT, suppression, 404 tâche
  inconnue. Frontend vérifié via `tsc`/`oxlint`/`vite build` seulement — parcours
  navigateur à faire manuellement (même limite d'environnement que d'habitude).
- `/api/profile` n'expose pas les attributs RPG (seulement XP/niveau) — le
  feedback "+1 INT" ne peut pas être affiché précisément côté UI tant que le
  DTO profil ne les renvoie pas (à traiter avec G1-T04/G1-T06).
- Habitudes : pas de décocher (le gain est déjà appliqué — choix assumé), pas
  d'édition/suppression (suppression = action destructive à confirmer, v2).
- Agenda : pas de récurrence, pas de resize par poignée, drag 1h de granularité,
  chevauchement d'événements non géré visuellement (ils se superposent).
- Toujours aucun test automatisé (le calcul de streak de `HabitService` serait
  le premier bon candidat JUnit).

**Écarts/dette introduits par le dashboard G0-T03/G1-T04/G1-T05/G1-T06 (2026-07-17) :**
- Backend vérifié par HTTP réel : 2 validations → niveau 2 "Initié" (100 XP, seuil
  300), journal 2 lignes, progression SEMAINE/ANNEE avec bons buckets, upload PNG
  → fichier redimensionné sur disque + servi en 200 sans token (bug `Path.toUri()`
  sans slash final corrigé dans `WebConfig`), mauvais format refusé 400. Frontend :
  `tsc`/`oxlint`/`vite build` seulement — parcours navigateur manuel à faire
  (dashboard, upload photo, graphiques).
- `/uploads/**` est public (les `<img>` ne peuvent pas porter le JWT) — protégé
  seulement par noms de fichiers UUID non devinables. À revoir si les photos
  deviennent sensibles (URL signées ou proxy authentifié).
- Palette des 6 couleurs d'attributs passée au validateur dataviz : CVD, chroma
  et contraste OK, mais "lightness band" en échec (le jaune PRE ressort plus que
  le bleu INT). Couleurs = tokens produit globaux, non modifiés ici ; mitigation :
  chaque marque graphique porte son libellé et sa valeur en texte. À traiter si
  reskin du thème.
- L'origine backend (`http://localhost:8081`) est en dur dans `apiClient`
  (préexistant, maintenant exporté aussi pour les images) — à passer en variable
  d'environnement Vite avant tout déploiement.
- Toujours aucun test automatisé (`User.ajouterXp`/seuils et l'agrégation
  `StatsService` seraient les premiers bons candidats).

## Dette technique connue

- ~~Filtre JWT manquant~~ — **résolu** avec G0-T02 (`JwtAuthFilter` +
  `UserDetailsServiceImpl` + `JsonAuthenticationEntryPoint` pour un vrai 401 JSON
  au lieu du 403 par défaut de Spring Security). Vérifié : `GET /api/profile`
  sans token → 401 ; avec token valide → 200.
- ~~CORS en wildcard sur AuthController uniquement~~ — **résolu** (2026-07-10) :
  CORS centralisé dans `SecurityConfig` sur `/api/**`, restreint à l'origine du
  frontend (`gamify.cors.allowed-origin`), wildcard retiré.

## Ordre fonctionnel conseillé (dépendances)

1. **G0-T01 à G0-T03** — socle, auth, profil, navigation. Aucune dépendance externe.
2. **G1-T04 à G1-T06** — attributs, XP, radar chart/statistiques. Nécessite le profil (G0-T02).
3. **G1-T07 à G1-T09** — activités, kanban, objectifs chiffrés. Nécessite les attributs (G1-T04).
4. **G1-T10 à G1-T12** — agenda, habitudes/streaks, notifications. Peut être développé en parallèle du point 3.
5. **G1-T13 à G1-T14** — avatar et animations de gain/pénalité. **Priorité haute** — c'est le cœur de l'expérience Solo Leveling ("effet wow"). Nécessite les attributs disponibles.
6. **G2-T15 à G2-T18** — badges, upload photo preuve, multi-utilisateurs/classement, recette de bout en bout globale. En dernier.

## Détail des tickets (résumé)

### Phase 0
- **G0-T01** Page d'inscription/connexion + bouton "Essayer en démo" prérempli.
- **G0-T02** Création profil : pseudo, avatar initial, choix des domaines (≥1),
  chaque domaine lié à un attribut visible, modifiable plus tard.
- **G0-T03** Navigation principale + tableau de bord (niveau, XP, attributs, résumé
  du jour, tâches du jour, streak en cours, dernier badge).

### Phase 1
- **G1-T04** Attributs INT/FOR/VIT/PRE/CHA/RES avec règles +1/−2/−3(PRE)/plancher 0/
  malus −5 après 3 jours de manque (détail complet dans `domain.md`).
- **G1-T05** Système de niveaux/XP (courbe log, titres, animation de montée de niveau,
  niveau ne baisse jamais).
- **G1-T06** Radar chart des 6 attributs + vue statistiques (hebdo/mensuel/annuel,
  régressions en rouge, progressions en vert).
- **G1-T07** Création/validation d'activité (titre, domaine, fréquence, objectif,
  1 attribut principal, animations +1/−2 instantanées).
- **G1-T08** Kanban À faire/En cours/Terminé, drag & drop, passage en Terminé =
  validation auto + gain, persistance entre sessions.
- **G1-T09** Vue liste complémentaire : objectifs chiffrés, ratio réalisé/objectif,
  filtres domaine/attribut, tri.
- **G1-T10** Agenda planning hebdomadaire, ajout/déplacement d'activités, vues
  semaine/mois/jour, validées en vert / manquées en rouge.
- **G1-T11** Streaks : compteur de jours consécutifs, grille type GitHub (12
  semaines), bonus +10 XP à 7 jours, record personnel conservé.
- **G1-T12** Notifications : rappel 30 min avant, alerte 22h si non validé,
  célébration niveau/badge, configurable/désactivable par catégorie.
- **G1-T13** Avatar : états dynamiques (normal/progression/régression/chute après 3
  manques), animations enthousiasme/souffrance, niveau+titre affichés.
- **G1-T14** Animations gain/pénalité/montée de niveau/badge — **priorité haute**.

### Phase 2
- **G2-T15** Badges Bronze/Argent/Or par domaine, déblocage auto + animation +
  notification, galerie acquis/à débloquer.
- **G2-T16** Upload photo preuve d'activité (+2 pts au lieu de +1), redimensionnement,
  suppression possible.
- **G2-T17** Multi-utilisateurs : classement général/par attribut, profils publics/
  privés, fil d'activité social.
- **G2-T18** Recette fonctionnelle de bout en bout (scénario complet inscription →
  activité → kanban/agenda/habitudes → animations → badges/classement).

## Où regarder pour le détail complet

Chaque ticket a des critères d'acceptation précis dans le PDF source
(`docs/Gamify_Sprint_Backlog.pdf`) — relire le ticket concerné avant de le démarrer
si un doute subsiste sur un critère.
