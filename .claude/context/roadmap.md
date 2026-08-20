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
| G0-T03 | ✅ Fait | 2026-07-17 | Tableau de bord réel (`DashboardPage`) : carte du personnage façon FIFA (photo uploadée ou emoji de classe, niveau+titre, note générale = moyenne des 6 attributs, barre d'XP vers le prochain seuil), barres d'attributs + radar SVG, XP par période (semaine/mois/année), journal du jour. Pas encore de streak ni dernier badge sur le dashboard (badges = G2-T15). |
| G1-T05 | ✅ Fait | 2026-07-17 | Courbe de niveaux dans `User.ajouterXp` : seuils doublants (niveau n à 100·(2^(n−1)−1) XP : 100, 300, 700...), 8 titres Novice→Légende, niveau ne baisse jamais. Vérifié : 100 XP → niveau 2 "Initié", seuil suivant 300. Pas d'animation de montée de niveau (G1-T14). |
| G1-T04 | ✅ Fait | 2026-08-19 | Volet malus complété : `UserProfile.appliquerMalusInactivite` applique −2/jour sans gain (−3 pour PRE), plancher 0, +−5 cumulé exactement au 3ᵉ jour consécutif de manque (compteur par attribut, remis à 0 dès qu'un gain a lieu). Job `InactivityPenaltyService` (par jour, par profil, idempotent via `derniereEvaluationPenalites`), déclenché à minuit par `InactivityPenaltyScheduler` (`@EnableScheduling`) et manuellement via `POST /api/backoffice/penalites/executer` (admin, rattrapage + tests). Chaque malus historisé dans `ProgressionLog` (delta négatif, daté du jour évalué). Migration V17. |
| G1-T06 | ✅ Fait | 2026-08-20 | Radar chart 6 attributs + barres colorées + graphique XP par semaine/mois/année (`/api/stats/progression`, buckets zéros compris) + journal du jour paginé (`/api/stats/journal`). Volet restant (affichage des pertes issues du malus G1-T04) complété : `JournalDuJour` colorait déjà les entrées négatives en rouge/positives en vert depuis sa création (rien à faire) ; `ProgressionChart` (graphique "XP gagnés") devient un diagramme en barres divergentes — XP gagné (violet) vers le haut, points d'attributs perdus par malus (rouge, nouveau champ `pertesAttributs`) vers le bas d'une ligne zéro, chaque barre légendée par sa valeur (échelles indépendantes, l'XP n'étant jamais touchée par un malus — voir écart ci-dessous). Pas d'animation/tremblement (reste le périmètre G1-T14 "animations gain/pénalité"). |
| G1-T07 | 🔶 Partiel | 2026-07-10 | Création/validation de tâches (`Activity` + `ActivityService`/`Controller`, CRUD create/list/valider). Gain d'attribut à la validation implémenté en version **minimale** (`User.appliquerGainAttribut` : +1 seulement) — pas de malus/plancher/historisation `ProgressionLog`/recalcul de niveau, volontairement reporté à G1-T04/G1-T05 (décision utilisateur : ne pas développer G1-T04 tout de suite). Pas encore d'animations +1/−2 instantanées (ticket original les mentionne, hors scope ici — vue liste simple, pas de Kanban). |
| G1-T10 | ✅ Fait | 2026-08-20 | Agenda 3 vues (semaine/jour/mois) sur `/agenda` : événements libres **ou liés à une tâche** (`AgendaEvent.activity` optionnel), couleur selon règle du ticket (accent violet / vert TERMINE / rouge manqué), ligne "maintenant", clic sur créneau = création préremplie, déplacement par drag & drop HTML5 (granularité 1h) ou édition en modale, suppression avec confirmation. Backend : CRUD `/api/agenda` borné `from`/`to` paginé. **Récurrence ajoutée** : occurrences matérialisées (`serie_id` partagé, migration V18), fréquence quotidien/hebdomadaire (jours de semaine)/mensuel, date de fin obligatoire (max 1 an), UI "Répéter" à la création, choix "cette occurrence seule" (détachement auto de la série) vs "toute la série" à l'édition/suppression. **Resize par poignée ajouté (frontend seulement)** : poignée visible au survol sur le bord bas d'un événement (vues Semaine/Jour), glisser par pointer events (retour visuel continu, pas de DnD natif), granularité 15 min, durée mini 30 min, pas de franchissement de minuit, réutilise `PUT /api/agenda/{id}` tel quel — aucun changement backend pour ce volet. |
| G1-T11 | 🔶 Partiel | 2026-07-26 | Tracker d'habitudes façon HabitKit sur `/habits` : carte par habitude (icône emoji, couleur, bouton ✓ du jour), grille de contributions 12 semaines (84 jours) compacte façon GitHub, tooltip date au survol prolongé, clic sur le nom = modale de détail avec calendrier mensuel navigable (cocher/annuler n'importe quel jour passé en un clic). Check = +1 attribut ciblé + 10 XP, **bonus +10 XP à chaque multiple de 7 jours de série** (domain.md), re-check refusé sur une date déjà cochée (409), date future refusée (400). **Annulation** d'une complétion (n'importe quel jour, double-clic sur la petite grille ou clic dans le calendrier) : annulation logique (`HabitCompletion.annule`, ligne jamais supprimée), reprise symétrique de l'XP/attribut, `meilleurStreak` recalculé honnêtement sur l'historique complet restant. Reste : notifications (G1-T12), éditer/supprimer une habitude. |
| G1-T09 | 🔶 Partiel | 2026-08-20 | Vue **kanban** 3 colonnes (À faire / En cours / Terminé) façon Azure DevOps Boards sur `/activities` : cartes avec liseré coloré par attribut, drag & drop HTML5 natif + boutons "Commencer"/"Valider", création via modale (`Modal` générique dans `components/ui/`, hauteur bornée + scroll interne pour le paysage mobile). Responsive : rail horizontal à snap (une colonne ≈ 85% de l'écran) sous `md`, grille 3 colonnes au-dessus ; `viewport-fit=cover` ajouté pour les écrans à encoche. Backend : `PATCH /api/activities/{id}/statut` (EN_COURS libre, TERMINE applique les récompenses, sortie de TERMINE refusée). **Filtres/tri ajoutés (2026-08-20)** : `ActivityFilters` (Select domaine + Select attribut + Select tri) au-dessus du board, état porté par `useActivityFilters` (query params `domaine`/`attribut`/`sort` via `useSearchParams`, partageable/rafraîchissable), branché sur `useActivities`/`activityService.listActivities`. **Zéro changement backend** : `ActivityController.search` acceptait déjà `domaineId`/`attributCible`/`Pageable`, et Spring Data JPA ajoute l'ORDER BY à partir du `Sort` du `Pageable` même sur une méthode `@Query` — vérifié par appels HTTP réels (curl, compte admin) : filtre domaine, filtre attribut, tri `createdAt` asc/desc, tri `statut` asc/desc, combinaison filtre+tri. Écart assumé : critère d'acceptation d'origine "tri par échéance" **non fait** — `Activity` n'a aucun champ date d'échéance (ni entité, ni DTO), décision utilisateur de ne pas l'ajouter dans ce ticket (voir dette ci-dessous). Toujours pas de ratio réalisé/objectif. |
| G2-T15 | 🔶 Partiel | 2026-08-19 | Backoffice admin livré (périmètre plus large que le seul ticket, voir écarts) : CRUD domaines système (créer/modifier/désactiver), catalogue de badges Bronze/Argent/Or par domaine (CRUD complet), saisons (créer/clôturer, une seule active à la fois — fenêtre de comptage des badges), classement/stats utilisateurs (lecture seule, tri XP/niveau). Déblocage auto de badges branché dans `ActivityService`/`HabitService`. Rôle `ROLE_ADMIN` unique désigné par email (`gamify.admin.email`), `/api/backoffice/**` protégé, garde `RequireAdmin` côté front. Manque pour clore G2-T15 : animations/notifications de déblocage, galerie de badges côté joueur (`GET /api/badges/me` existe côté API, aucune UI ne l'appelle). |
| — (tests) | ✅ Fait | 2026-08-19 | Dette technique "aucun test automatisé" comblée pour son périmètre minimal : JUnit backend (`UserProfileTest` — `ajouterXp`/`seuilXpPourNiveau` ; `HabitServiceTest` — streak courant, bonus 7 jours, recalcul de `meilleurStreak` après `annuler` ; `StatsServiceTest` — agrégation `progression`/`journalDuJour`), Vitest frontend (`useHabits.test.ts` — chargement, `toggleHabit` succès/échec avec rollback optimiste, garde "déjà fait aujourd'hui"), CI GitHub Actions minimale (`.github/workflows/ci.yml`, 2 jobs `backend-tests`/`frontend-tests`, déclenchée sur chaque PR + push `main`). |
| — (sécu) | ✅ Fait | 2026-08-19 | Séparation `User` (credentials : id/username/email/password/is_admin/audit) / `UserProfile` (données de jeu : attributs RPG, xp/niveau/titre, avatar, domaines trackés) — relation 1-1 à clé partagée `@MapsId`, unidirectionnelle. Objectif : la table qui porte le mot de passe hashé n'est plus requêtée/modifiée à chaque gain de point. Migrations `V15` (split + copie des données existantes) et `V16` (colonne `is_admin` persistée, backfillée pour `admin@admin.com`). Services mis à jour : `AuthService`, `ProfileService`, `ActivityService`, `HabitService`, `AdminUserService`, `UserDetailsServiceImpl`. Vérifié par appels HTTP réels (register/login dont l'admin de test, `GET`/`PUT /api/profile`, validation d'activité, check d'habitude, classement admin) après migration sur DB locale existante (comptes pré-existants conservés, ex. `demo` niveau 3/330 XP toujours correct après migration). |

**Écarts/dette introduits par la séparation credentials/profil (— (sécu)), notés consciemment :**
- Rôle admin : passage d'un calcul à la volée par email (`gamify.admin.email`,
  recalculé à chaque login) à une colonne persistée `is_admin`, initialisée
  une seule fois à l'inscription. Changer `gamify.admin.email` après coup ne
  déplace plus l'admin automatiquement sur les comptes déjà créés — pas de
  mécanisme de promotion dédié si plusieurs admins deviennent nécessaires
  (hors scope ici, à traiter si le besoin apparaît).
- `user_tracked_domains.user_id` continue de référencer `users(id)` en base
  (FK inchangée) alors que la relation est maintenant portée par
  `UserProfile` côté JPA — reste valide car `user_profiles.user_id` **est**
  `users.id` (clé partagée), non retouché pour limiter le risque de la
  migration.
- Aucun test JUnit ajouté sur `AuthService`/`ProfileService`/`AdminUserService`
  malgré la logique déplacée — cohérent avec l'absence de suite de tests
  existante sur le projet (dette déjà connue, pas aggravée ici).

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
- ~~Pas d'UI de filtres/tri sur `/activities` côté frontend~~ — **résolu**
  (2026-08-20, voir ligne G1-T09 ci-dessus).
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
- Habitudes : décocher est maintenant possible (voir écarts du 2026-07-26
  ci-dessous) ; pas d'édition/suppression de l'habitude elle-même (suppression =
  action destructive à confirmer, v2).
- Agenda : pas de récurrence (~~pas de resize par poignée~~ résolu 2026-08-20,
  voir écart dédié), drag 1h de granularité, chevauchement d'événements non géré
  visuellement (ils se superposent).
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

**Écarts/dette introduits par l'annulation de complétion G1-T11 (2026-07-26) :**
- Tension de domaine tranchée avec l'utilisateur : `HabitCompletion` était
  documenté append-only ("on n'efface jamais les données passées"). Décocher est
  donc une **annulation logique** (`annule`/`bonus_applique` ajoutés en V8, index
  unique déplacé sur les lignes actives en V9 — la contrainte V6 bloquait le
  re-check du même jour après une annulation, corrigé avant de livrer), jamais un
  `DELETE` physique. L'XP/attribut gagnés sont repris symétriquement
  (`User.retirerXp`/`retirerGainAttribut`), et `meilleurStreak` est recalculé sur
  tout l'historique actif restant (peut baisser) — décisions utilisateur
  explicites, à ne pas reconsidérer sans repasser par lui.
- Backend vérifié par HTTP réel (compte jetable) : check → annulation → re-check
  → annulation, `faitAujourdhui`/`streakCourant`/`completions` reviennent bien en
  arrière à chaque fois, `/api/stats/journal` montre les deux entrées correctives
  (+1 puis −1, jamais de ligne supprimée) ; annuler une date jamais cochée → 404.
  Recalcul historique de `meilleurStreak` (`computeMeilleurStreakHistorique`) pas
  testé sur un historique multi-jours réel faute d'accès `psql` dans cet
  environnement — logique simple (plus longue suite de dates consécutives) mais
  à surveiller si un bug de streak est signalé.
- Frontend : `tsc`/`oxlint` propres, mais parcours navigateur (double-clic pour
  annuler, tooltip au survol ~700ms, densité de grille/police façon GitHub) **pas
  vérifié dans un navigateur réel** — pas d'outil d'automatisation ici (même
  limite d'environnement que les features précédentes), laissé à tester
  manuellement par l'utilisateur.
- Toujours aucun test automatisé (le recalcul de `meilleurStreak` après
  annulation serait un bon candidat JUnit, vu sa sensibilité aux erreurs
  d'aléas de dates).

**Écarts/dette introduits par la modale calendrier G1-T11 (2026-07-26) :**
- `HabitService.check(email, habitId)` généralisé en `checkDate(email, habitId, date)`
  (l'ancien `check` délègue à `checkDate(..., LocalDate.now())`, comportement du
  bouton ✓ de la carte inchangé) pour permettre de cocher n'importe quel jour
  passé depuis le calendrier de la modale de détail — nouvel endpoint
  `POST /api/habits/{id}/completions/{date}`, symétrique du `DELETE` d'annulation
  déjà en place. Garde-fou : date future refusée (400).
- Backend vérifié par HTTP réel (compte jetable) : check sur une date passée
  (2026-07-20) → 200, `completions` à jour ; même date une 2e fois → 409 "déjà
  cochée pour cette date" ; date future (2026-12-31) → 400.
- Modale construite sur le `Modal` générique existant + calendrier mensuel
  réimplémentant volontairement le pattern de
  `features/agenda/components/MonthView.tsx` (grille 42 cellules, lundi en
  premier) plutôt que de l'importer depuis `agenda/` — indépendance des
  features (même choix que la duplication de l'appel `/api/domaines` dans
  `habitService.ts`). Un `features/habits/utils/date.ts` a été créé pour
  mutualiser `toIsoDate` (jusque-là dupliqué dans `HabitGrid.tsx` et
  `useHabits.ts`) et les nouveaux utilitaires de calendrier.
- Périmètre volontairement réduit par rapport à la référence HabitKit
  (capture utilisateur) : pas d'objectif chiffré, pas de compteur
  d'hydratation, pas d'édition/réglages depuis la modale — juste le calendrier
  et cocher/annuler, décision utilisateur explicite.
- Frontend : `tsc`/`oxlint` propres, parcours navigateur (ouverture au clic sur
  le nom, navigation mois précédent/suivant, clic pour cocher/décocher une
  date) **pas vérifié dans un navigateur réel** — même limite d'environnement
  que le reste de la feature habitudes, à tester manuellement par
  l'utilisateur.

**Écarts/dette introduits par la récurrence agenda G1-T10 (2026-08-20) :**
- **Occurrences matérialisées, décision assumée** (vs règle virtuelle expansée à
  la volée, tranchée avec l'utilisateur) : chaque occurrence d'une série est une
  ligne `agenda_events` normale, regroupées par `serie_id` (id de la 1ère
  occurrence, partagé). Réutilise tel quel `GET /api/agenda?from&to` et le
  drag & drop existants (id réel par occurrence). Contrepartie : date de fin de
  récurrence **obligatoire**, bornée à 1 an après le début (pas de récurrence
  infinie, décision utilisateur assumée — pas de job planifié à ajouter pour
  étendre un horizon glissant).
- `serie_id` est **volontairement sans contrainte FK** (juste une valeur de
  regroupement) : avec `GenerationType.IDENTITY`, le 1er id n'est connu qu'après
  l'INSERT (update en 2 temps nécessaire de toute façon), et une FK
  auto-référencée sur `agenda_events.id` casserait dès qu'on supprime *cette
  occurrence précise seule* (violation de contrainte, ou CASCADE qui
  supprimerait toute la série par erreur).
- Édition/suppression d'une occurrence seule : **pas de nouvel endpoint**,
  `PUT /api/agenda/{id}` détache automatiquement la ligne de sa série
  (`detachee=true`) dès qu'elle est éditée directement — une ligne détachée
  n'est plus jamais touchée par une édition/régénération "toute la série".
  Conséquence assumée : le **drag & drop** (qui appelle ce même endpoint)
  détache donc aussi l'occurrence déplacée, sans prompt "cette occurrence /
  toute la série" — ce choix n'est proposé que dans la modale d'édition
  explicite, comme demandé par le ticket.
- Édition "toute la série" (`PUT /api/agenda/{id}/serie`) : les occurrences déjà
  passées gardent leur date d'origine (seuls titre/activité/heure-du-jour sont
  réappliqués) ; seules les occurrences futures non détachées sont supprimées
  puis régénérées selon la (nouvelle) règle. Bug intercepté et corrigé pendant
  la vérification HTTP : si "aujourd'hui" avait déjà une occurrence passée dans
  la journée, la régénération (qui démarre aussi à `today`) créait un doublon
  ce jour-là — corrigé en excluant explicitement les dates déjà couvertes par
  les occurrences passées conservées.
- Limitation connue et acceptée (non corrigée) : la régénération ne vérifie pas
  les dates déjà occupées par une occurrence **détachée** — une occurrence
  détachée déplacée sur une date qui redevient générée par la série peut donc
  coexister avec elle (chevauchement visuel), cohérent avec la dette déjà
  connue "chevauchement d'événements non géré visuellement" (voir plus haut).
  MENSUEL avec un départ le 31 saute aussi les mois plus courts (pas de repli
  "dernier jour du mois") — comportement documenté dans
  `AgendaService.generateOccurrenceDates` et couvert par un test dédié.
- Suppression "toute la série" (`DELETE /api/agenda/{id}/serie`) : supprime
  **toutes** les occurrences y compris celles détachées — décision assumée
  ("toute la série" = tout disparaît, pas d'exception cachée).
- Vérifié par appels HTTP réels (curl, compte jetable `agendarec_*@test.com`) :
  création d'une série hebdomadaire (lundi/mercredi, 8 occurrences sur
  4 semaines, même `serieId`) et d'une série quotidienne à cheval passé/futur ;
  liste par plage `from`/`to` retournant bien toutes les occurrences ; édition
  d'une occurrence seule → `detachee=true` confirmé en base ; édition de toute
  la série → occurrences passées mises à jour sur place (même date, nouvelle
  heure/titre), occurrences futures régénérées selon la nouvelle règle,
  occurrence détachée intacte (confirme le correctif du doublon "aujourd'hui"
  ci-dessus) ; suppression d'une occurrence seule (reste de la série intacte) ;
  suppression de toute la série (plus aucune ligne) ; 4 cas d'erreur 400
  (`finRecurrence` avant le début, hebdomadaire sans jour choisi, récurrence
  > 1 an, `/serie` sur un événement non récurrent) ; 403 confirmé sur la série
  d'un autre utilisateur (`findOwnedSerie` filtre par `user.id`, même patron
  que `findOwnedEvent`). Frontend : `tsc -b`, `oxlint`, `npm run build`,
  `npm test` (5 tests, `useHabits` inchangé) propres. **Pas de parcours
  navigateur réel** (même limite d'environnement que tous les tickets
  précédents, pas d'outil d'automatisation navigateur disponible ici) — à
  vérifier manuellement par l'utilisateur via `scripts/devctl.ps1` : créer un
  événement récurrent hebdo, vérifier son apparition sur plusieurs semaines en
  vues Semaine/Mois (icône ↻), éditer "cette occurrence seule" vs "toute la
  série", supprimer chaque portée.
- `AgendaService` reste sans test Mockito sur `create`/`update`/`updateSeries`/
  `deleteSeries` (seule `generateOccurrenceDates`, logique pure, est couverte
  par `AgendaServiceTest`) — dette déjà connue sur cette classe, non aggravée.
- Comptes de test (`agendarec_*@test.com`, `agendarec2_*@test.com`) et leurs
  événements laissés en base locale (même pratique que les comptes jetables
  des tickets précédents) — à nettoyer si la base doit rester propre.

**Écarts/dette introduits par le resize par poignée G1-T10 (2026-08-20, frontend seulement) :**
- Une seule poignée, bord bas uniquement (étire/raccourcit la fin, le début ne
  bouge jamais) — l'AC parle d'"une poignée" au singulier, décision assumée de
  ne pas ajouter de poignée haute symétrique dans ce ticket.
- Implémenté en pointer events (`onPointerDown`/`window.addEventListener`
  pointermove/pointerup) plutôt qu'en drag & drop HTML5 natif comme le
  déplacement existant : le DnD natif ne donne pas de retour visuel continu
  pendant le geste sans dessiner sa propre image de drag, alors que les pointer
  events permettent un aperçu en direct de la nouvelle hauteur pendant qu'on
  tire. La poignée porte `draggable={false}` pour ne pas déclencher le DnD natif
  du bouton parent (technique standard pour exclure une zone d'un ancêtre
  draggable).
- Granularité 15 min (plus fine que le déplacement à 1h, autorisé par l'AC
  "1h, ou plus fin si voulu"), durée minimale 30 min, pas de franchissement de
  minuit (23:59 max) — mêmes limites que le reste de l'agenda (pas de support
  multi-jour).
- Même limite déjà connue que le drag & drop existant : **pas de support
  tactile** (pointer events couvrent la souris, mais l'absence de `:hover` sur
  tactile masque la poignée) — cohérent avec le fallback boutons déjà en place
  ailleurs (kanban), à revoir pour Capacitor.
- Aucun changement backend (ticket explicitement frontend seulement) : réutilise
  `agendaService.updateEvent`/`PUT /api/agenda/{id}` tel quel, déjà vérifié par
  HTTP réel sur les tickets agenda précédents.
- Vérifié : `tsc -b`, `oxlint`, `npm run build`, `npm test` (5 tests) propres.
  **Pas de parcours navigateur réel** (même limite d'environnement que toute la
  feature agenda, pas d'outil d'automatisation navigateur ici) — le geste de
  redimensionnement en lui-même (tirer la poignée à la souris) est justement ce
  qui reste à valider manuellement par l'utilisateur.
- **Point notable, sans lien avec ce ticket, résolu depuis** : au moment
  d'écrire ce ticket, l'implémentation de la récurrence (migration V18,
  `serie_id`, endpoints `/serie`...) semblait avoir disparu du disque (working
  tree revenu à l'état du commit `d6acb39`, sans trace des fichiers créés) —
  signalé à l'utilisateur plutôt que reconstruit en silence. Il s'agissait en
  réalité d'un conflit de `git stash pop` sur `roadmap.md`/`CLAUDE.md` (pas un
  vrai merge Git — marqueurs "Updated upstream"/"Stashed changes"), le code de
  la récurrence lui-même ayant déjà été committé et mergé via la PR #38
  (`1437fb1`/`d942aec`) avant ce ticket. Les deux jeux de changements
  documentaires (récurrence + resize) sont fusionnés ci-dessus plutôt que l'un
  écrasant l'autre.

**Écarts/dette introduits par le backoffice admin G2-T15 (2026-08-19) :**
- Périmètre livré plus large que G2-T15 seul : CRUD domaines système et
  classement/stats utilisateurs (lecture seule) ne correspondent à aucun
  ticket formel du backlog d'origine — ajout hors-backlog à la demande de
  l'utilisateur, même logique que la personnalisation des domaines en G0-T02.
- Migrations V10 à V14 : `domaines.actif` (désactivation logique, jamais de
  suppression physique), `saisons` (une seule active à la fois — index unique
  partiel sur `cloturee=false` — pas de `PUT`/suppression, seulement créer et
  clôturer), `badge_definitions`/`user_badges` (append-only, un badge peut
  être regagné à chaque nouvelle saison), seed d'une saison de départ + 15
  badges (3 paliers × 5 domaines système, seuils de validations arbitraires —
  ajustables ensuite depuis `/admin/badges` sans nouvelle migration), seed
  d'un compte de test `admin@admin.com` / `admin` (rôle admin désigné par
  email via `gamify.admin.email`, qui ne pointe plus vers l'email personnel
  de l'utilisateur — décision explicite pour faciliter les tests locaux).
- **Sécurité — ne jamais reproduire hors local** : le compte seedé en V14 a un
  mot de passe faible et connu (`admin`), son hash BCrypt est commité en clair
  dans l'historique git. Acceptable en dev solo ; à retirer ou changer avant
  tout partage/déploiement de ce repo.
- Vérifié : `mvnw clean compile` (92 fichiers) et `npm run build`/`npm run
  lint` propres des deux côtés ; connexion admin testée en HTTP réel (curl,
  `isAdmin: true` retourné) après correction d'un blocage Flyway au démarrage
  (conflit de clé unique sur `users.email`, causé par un compte de diagnostic
  créé par erreur pendant les tests puis nettoyé en base). CRUD (créer/
  modifier/désactiver un domaine et un badge, créer/clôturer une saison,
  classement paginé trié XP/niveau) vérifié manuellement dans le navigateur
  par l'utilisateur — pas de test HTTP réel systématique sur chacun des 4 CRUD
  au-delà du login.
- Bug corrigé au passage : `AdminDomainesPage`/`RequireAdmin` existaient déjà
  en fichiers mais n'étaient câblés nulle part dans `AppRouter.tsx` (aucune
  route ne les montait). Les 4 pages admin (domaines/users/saisons/badges)
  sont maintenant sous `RequireAdmin`, avec une section "Administration" dans
  `Sidebar.tsx` visible seulement si `isAdmin`.
- Toujours aucun test automatisé (les 4 CRUD backoffice et
  `BadgeService.evaluateAndUnlock` seraient de bons premiers candidats JUnit).
- Reste hors scope pour clore G2-T15 : animations de déblocage, notifications,
  galerie de badges côté joueur (`GET /api/badges/me` existe côté API, aucun
  composant front ne l'appelle). Le classement admin (`/admin/users`) n'est
  pas non plus le classement public multi-utilisateurs de G2-T17 (profils
  publics/privés, fil d'activité social — non traité).

**Écarts/dette introduits par le malus d'inactivité G1-T04 (2026-08-19) :**
- **Décision non explicite dans domain.md, à noter** : le malus n'évalue que les
  attributs liés à au moins un domaine que l'utilisateur **track**
  (`UserProfile.domainesTrackes`), pas les 6 attributs systématiquement. Raison :
  domain.md ne prévoit aucun moyen de regagner un attribut hors domaine tracké
  (créer une activité/habitude nécessite un domaine, et rien n'oblige un domaine
  ciblé à être dans `domainesTrackes`), donc évaluer les 6 sans distinction
  ferait tomber à 0 en ~5 jours tout attribut qu'un utilisateur n'a jamais eu la
  possibilité de faire progresser — verrou définitif plutôt qu'un mécanisme
  d'équilibrage. À reconsidérer si le produit veut au contraire pousser à
  équilibrer tous les attributs dès l'inscription.
- Le malus cumulé de −5 (domain.md : "3 jours consécutifs de manque") est
  interprété comme un **seuil ponctuel** : appliqué une seule fois, exactement
  au 3ᵉ jour consécutif de manque (comme l'état "chute" de l'avatar après 3
  manques, même section de domain.md), pas rejoué à chaque jour au-delà (jour 4,
  5...) ni répété tous les 3 jours. À clarifier avec l'utilisateur si un
  comportement répétitif était attendu.
- Job idempotent par profil via `UserProfile.derniereEvaluationPenalites` (jour
  déjà évalué jamais retraité) — permet un rattrapage jour par jour si le
  serveur était arrêté à minuit. Déclenché en prod par `InactivityPenaltyScheduler`
  (`@Scheduled` minuit, bean séparé du service pour ne pas contourner le proxy
  `@Transactional` par self-invocation) et manuellement par
  `POST /api/backoffice/penalites/executer` (admin, paramètre `date` optionnel) —
  ce dernier endpoint existe surtout pour permettre la vérification HTTP réelle
  exigée par le ticket sans attendre un vrai minuit.
- **Risque identifié, pas corrigé ici** : `UserProfile.retirerGainAttribut`
  (annulation d'une complétion d'habitude, G1-T11) n'a pas de plancher à 0. Si un
  attribut est déjà tombé à 0 par malus puis qu'une ancienne complétion sur ce
  même attribut est annulée, l'attribut peut passer négatif. Pas rencontré dans
  les tests ci-dessous (aucune annulation combinée à un malus), mais à corriger
  si signalé.
- Vérifié par appels HTTP réels (curl, comptes jetables `malustest`/`malustest2`) :
  domaines trackés = Sport (FOR/VIT) + un domaine perso PRE/CHA, `INT`/`RES` hors
  scope volontairement non trackés. Après 2 jours de manque backdatés en base
  (`derniere_evaluation_penalites`) : FOR/VIT/CHA à 6 (10−2×2), PRE à 4 (10−3×2),
  INT/RES inchangés à 10, 8 lignes `progression_logs` (delta −2/−3 correctement
  attribué par jour). Après un 3ᵉ jour de manque : FOR/VIT/CHA/PRE tombent à 0
  (plancher respecté malgré −2/−3 puis −5 supplémentaire), 8 nouvelles lignes
  dont les 4 malus cumulés "3 jours consécutifs". Rejouer le job sur la même date
  ne crée aucune ligne supplémentaire (idempotence confirmée, 16 lignes stables).
  Endpoint refusé en 403 pour un compte non admin. Cas gain-le-jour-même vérifié
  sur un second compte : validation d'une tâche FOR le jour évalué → FOR épargné
  du malus (reste à 11, compteur remis à 0) tandis que VIT (non travaillé)
  tombe bien à 8 ce même jour — confirme que `reinitialiserManque` coupe
  correctement la série avant incrémentation du malus.
- Comptes de test (`malustest@test.com`, `malustest2@test.com`) et domaine perso
  "Tir a l arc" laissés en base locale (même pratique que les comptes jetables
  des tickets précédents) — à nettoyer si la base doit rester propre.
- Toujours aucun test automatisé (`UserProfile.appliquerMalusInactivite`/
  `InactivityPenaltyService` seraient de bons premiers candidats JUnit, la
  logique de rattrapage jour par jour étant la plus sensible aux erreurs).

**Écarts/dette introduits par les premiers tests automatisés (— (tests), 2026-08-19) :**
- Périmètre volontairement limité aux 4 critères d'acceptation du ticket, pas une
  suite exhaustive : `ActivityService`, `AuthService`, `ProfileService`,
  `AdminUserService`, `InactivityPenaltyService`/`UserProfile.appliquerMalusInactivite`
  (déjà signalés comme bons candidats dans les entrées précédentes de ce journal)
  restent sans test — dette non aggravée mais pas résorbée non plus.
- Le ticket nommait "`User.ajouterXp`" ; cette logique vit en réalité sur
  `UserProfile.ajouterXp` depuis la séparation credentials/profil (V15/V16) — testée
  là où elle vit réellement (`UserProfileTest`), écart de nommage noté dans la Javadoc
  du test plutôt que silencieux.
- Tests backend = unitaires purs (JUnit 5 + Mockito + AssertJ, `MockitoExtension`,
  aucun `@SpringBootTest`/Testcontainers/DB) — cohérent avec la cible "70% unitaires"
  de la convention et garde la CI simple (pas de service PostgreSQL à provisionner).
  Pas encore de test d'intégration réel (Flyway + `ddl-auto=validate` sur une vraie
  base) dans la CI — seule la compilation + les tests unitaires y tournent.
- `HabitServiceTest` couvre le recalcul de `meilleurStreak` après annulation
  (`computeMeilleurStreakHistorique`, privée) uniquement **indirectement** via
  `annuler()`, faute d'accès direct à la méthode privée — choix assumé, cohérent avec
  "tester le comportement public, pas l'implémentation".
- Frontend : `useHabits` choisi plutôt que `useActivities` (critère "au moins un des
  deux") car plus riche à tester (mutation optimiste + rollback via `runOptimistic`).
  `useActivities` reste sans test — même dette que le reste des hooks/composants.
- Premières dépendances de test installées côté frontend (`vitest`,
  `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`), config Vitest ajoutée
  dans `vite.config.ts` (`test: {...}`, setup global `src/test/setup.ts` pour les
  matchers jest-dom — dossier transverse au sens de frontend-workflow.md, pas propre à
  une feature). **Pool forcé sur `threads`** (`test.pool: 'threads'`) : le pool par
  défaut (`forks`) time out par manque de spawn de process enfant dans l'environnement
  sandboxé où ce ticket a été développé ; `threads` fonctionne identiquement en local et
  sur un runner CI classique (Linux non restreint) — à surveiller si un comportement
  diffère un jour entre les deux.
- `npm install` a fait remonter 4 vulnérabilités **high** préexistantes via `npm audit`
  (`nanoid`/`postcss`, transitives de la chaîne d'outils de test ; `react-router-dom`,
  déjà en dépendance de prod, sans lien avec ce ticket) — non corrigées ici
  (`npm audit fix` bumperait `react-router-dom` sans rapport avec les tests/CI, hors
  scope, à traiter séparément si jugé prioritaire).
- Bit exécutable de `gamify-backend/mvnw` corrigé dans l'index git (`100644` →
  `100755`, perdu probablement lors d'un commit fait depuis Windows) : sans ça, le job
  `backend-tests` de la CI (runner Linux) aurait échoué en "Permission denied" sur
  `./mvnw`.
- Vérifié : `mvnw test` (21 tests, 3 classes) et `npm test` (5 tests) passent en local,
  `tsc -b`/`oxlint`/`npm run build` toujours propres côté frontend. La CI elle-même
  (`.github/workflows/ci.yml`) n'a **pas** été vérifiée en la faisant tourner
  réellement sur GitHub (pas de push effectué dans cette session) — seule sa
  cohérence avec les commandes locales validées est garantie ; à confirmer au premier
  push/PR réel.

**Écarts/dette introduits par le volet restant de G1-T06 (2026-08-20) :**
- **Décision non explicite dans le ticket, à noter** : le critère "le graphique d'XP par
  période distingue visuellement les baisses" ne peut pas s'entendre littéralement — le
  malus d'inactivité (G1-T04) ne touche jamais `xpTotal` (voir Javadoc
  `InactivityPenaltyService.enregistrerMalus`, `xpAvant == xpApres` pour toute ligne de
  malus), donc l'XP gagnée sur une période ne peut structurellement jamais être négative.
  Interprété comme : le graphique existant ("XP gagnés") doit aussi rendre visibles les
  pertes de **points d'attributs** (le vrai sens de "pertes de points" dans la description
  du ticket), pas une XP négative qui n'existera jamais. `PointProgressionResponse` gagne
  un champ `pertesAttributs` (somme en valeur absolue des deltas `ProgressionLog` négatifs
  de la période, symétrique de `gainsAttributs` qui existait déjà côté DTO mais n'était
  consommé par aucun composant frontend avant ce ticket — champ mort comblé). `ProgressionChart`
  devient un diagramme en barres divergentes autour d'une ligne zéro (XP en violet vers le
  haut, `pertesAttributs` en rouge vers le bas), avec deux échelles indépendantes (les deux
  métriques n'étant pas comparables en unité) — chaque barre porte sa valeur exacte en texte
  pour lever l'ambiguïté, et une légende explicite sous le titre. À reconsidérer si le
  produit veut un jour un malus qui retire aussi de l'XP (changerait la donne).
- `JournalDuJour` n'a nécessité **aucune modification** : le rendu rouge/vert sur
  `entry.delta >= 0` existait déjà depuis la création du dashboard (avant même G1-T04),
  écrit par anticipation — seul le graphique de progression avait la lacune.
- Vérifié par appels HTTP réels sur le compte `malustest@test.com` (backend relancé,
  `scripts` habituels) : `GET /api/stats/progression?periode=SEMAINE` — les 3 jours de
  malus déjà en base (17/18/19 août) remontent `pertesAttributs` à 9, 9, 29 (9 = malus
  journalier sur 4 attributs trackés — FOR/VIT/CHA à −2, PRE à −3 ; 29 = 9 + les 4 malus
  cumulés "3 jours consécutifs" à −5 le 3ᵉ jour), `xpGagne` à 0 sur ces trois jours ;
  `POST /api/backoffice/penalites/executer?date=2026-08-20` (admin) pour rattraper le jour
  courant a produit 4 nouvelles lignes `ProgressionLog` (delta −3 PRE, −2 CHA/FOR/VIT),
  visibles telles quelles sur `GET /api/stats/journal` (attribut + delta négatif + xpGagne
  à 0 par ligne) et agrégées à `pertesAttributs: 9` sur le point du jour dans `/progression`.
  Confirme l'agrégation backend bout-en-bout avec de vraies données de malus, pas seulement
  les mocks Mockito du test unitaire ajouté (`StatsServiceTest`, nouveau cas
  `progression_avecMalusInactivite_agregePertesAttributsEnValeurAbsolue`).
- Frontend : `tsc -b`, `oxlint`, `npm test` (5 tests, `useHabits` inchangé) et
  `vite build` propres. **Pas de parcours navigateur réel** (même limite d'environnement
  que les tickets précédents, pas d'outil d'automatisation navigateur disponible ici) — à
  vérifier manuellement par l'utilisateur via `scripts/devctl.ps1` sur le compte
  `malustest@test.com`/`malustest2@test.com` (mot de passe `password123`) pour voir le
  graphique divergent et le journal en rouge en conditions réelles.
- Backend relancé puis arrêté proprement après vérification (pas laissé tourner en tâche
  de fond à l'issue de la session).

## Dette technique connue

- ~~Filtre JWT manquant~~ — **résolu** avec G0-T02 (`JwtAuthFilter` +
  `UserDetailsServiceImpl` + `JsonAuthenticationEntryPoint` pour un vrai 401 JSON
  au lieu du 403 par défaut de Spring Security). Vérifié : `GET /api/profile`
  sans token → 401 ; avec token valide → 200.
- ~~CORS en wildcard sur AuthController uniquement~~ — **résolu** (2026-07-10) :
  CORS centralisé dans `SecurityConfig` sur `/api/**`, restreint à l'origine du
  frontend (`gamify.cors.allowed-origin`), wildcard retiré.
- **Pas de champ date d'échéance sur `Activity`** (constaté en faisant le volet
  filtres/tri de G1-T09, 2026-08-20) : ni sur l'entité JPA, ni sur
  `ActivityResponse`. Le ticket d'origine demandait un tri par échéance,
  volontairement pas fait (décision utilisateur) — le tri livré ne couvre que
  date de création (`createdAt`) et statut. Si un vrai champ échéance est voulu
  un jour : entité d'abord (nouveau champ + migration Flyway), puis DTO/
  formulaire/tri, pas l'inverse (règle domain-first du projet).
- `GET /api/activities?sort=<propriété inexistante>,asc` renvoie une 500 brute
  (JPQL invalide non catché par `GlobalExceptionHandler`) au lieu d'un 400
  propre — constaté en vérifiant G1-T09 par curl. Sans risque via l'UI (le
  frontend n'envoie que des valeurs whitelistées dans `useActivityFilters`),
  mais reste exploitable en modifiant l'URL à la main. Pas corrigé ici (hors
  scope filtres/tri UI), à traiter si `ActivityController.search` est retouché.

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
