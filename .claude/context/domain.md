# Règles du domaine Gamify

Condensé de `docs/dossier-system.pdf`. C'est la référence des règles métier du jeu —
à consulter avant d'implémenter toute logique liée aux attributs, activités, XP ou
progression. Ne pas réinventer une règle ici sans qu'elle soit issue de ce document
ou d'une décision explicite du user.

## Attributs (RPG)

6 attributs (voir `User.java` pour les noms actuellement en code : `intelligence`,
`force`, `vitesse`, `vitalite`, `charisme`, `resistance`, + `precision` — le sprint
backlog nomme la cible finale **INT, FOR, VIT, PRE, CHA, RES**, à clarifier/aligner
si les deux nomenclatures divergent) :

- Chaque attribut démarre à **10** et évolue de **+1** (activité validée) ou **−2**
  (activité manquée).
- **Plancher absolu à 0** — un attribut ne peut jamais devenir négatif.
- **3 jours consécutifs de manque** → malus cumulé supplémentaire de **−5 pts**.
- L'attribut **PRE (Précision)** décroît plus vite : **−3** au lieu de −2.
- Mise à jour instantanée à la validation ; les manques sont calculés/appliqués à
  minuit.
- Régression toujours **historisée** (visible, pas juste un nombre qui change).

## Domaines et activités

- Domaines trackables définis par l'utilisateur (Maths, Sport, Langues...).
- Chaque domaine est lié à **1 ou 2 attributs**.
- Fréquence par activité : quotidien / hebdomadaire / mensuel.
- Objectif chiffré par activité (ex. 5 exercices de maths / semaine).
- Une activité est customisable par l'utilisateur, **mais la supprimer après avoir
  terminé sa configuration initiale est une action irréversible** — à traiter comme
  une action destructive nécessitant confirmation explicite dans l'UI.
- Validation avec photo comme preuve → **+2 pts au lieu de +1** (Phase 2, G2-T16).
  Les photos sont redimensionnées avant stockage.

## Récompenses immédiates (feedback visuel — "effet wow")

Ce que l'utilisateur voit **au moment où il valide**, non différé :
- Texte flottant `+1 [ATTRIBUT]` en vert, ~1,5s, à la validation.
- Texte `−2 [ATTRIBUT]` en rouge avec tremblement, au manque.
- Notification de montée de niveau (écran de célébration).
- Badge débloqué → affiché instantanément, pas seulement dans une galerie.
- Les animations ne doivent jamais bloquer la navigation (superposition, pas modal
  bloquante).

## Niveaux et XP

- Courbe XP **logarithmique** : 100 XP pour passer niveau 2, puis doublement
  progressif.
- Chaque niveau a un **titre** (Novice → Initié → Guerrier → ... → Légende).
- **Le niveau ne baisse jamais**, même si les attributs régressent — seuls les
  attributs individuels peuvent descendre (jusqu'au plancher 0).
- 7 jours de série consécutive → bonus **+10 XP**.

## Habitudes / streaks

- Compteur de jours consécutifs (streak) visible en permanence.
- Grille de contributions type GitHub, 12 dernières semaines.
- Une série cassée remet le compteur à 0 **mais conserve l'historique** (ne jamais
  effacer les données passées).
- Le record personnel de série est conservé séparément du streak courant.

## Badges

- 3 paliers par domaine : Bronze → Argent → Or.
- Déblocage automatique dès condition remplie, avec animation + notification
  immédiate (pas seulement visible a posteriori dans une galerie).
- Certains badges spéciaux liés à des séries ou performances exceptionnelles
  (Phase 2).

## Avatar

- États visuels dynamiques selon la performance : normal / en progression / en
  régression / **en état de chute après 3 manques consécutifs**.
- Skins liés aux niveaux (évolution visuelle), personnalisables selon
  accomplissements en Phase 2.

## Notifications

- Rappel 30 min avant l'heure prévue d'une activité.
- Alerte si une activité quotidienne n'est pas validée à 22h.
- Célébration immédiate à un gain de niveau ou de badge.
- Configurables par catégorie et horaire dans les paramètres utilisateur.

## Fonctionnalités hors MVP (Phase 2 — enrichissement)

- Photos comme preuve d'activité (upload, redimensionnement, +2 pts).
- Multi-utilisateurs : classement général et par attribut, profils publics/privés,
  fil d'activité social.
- Skins déblocables selon accomplissements.
- Packaging APK Android (Capacitor/Expo).

## Stack validée dans le dossier système

Backend Java, Frontend (le dossier système mentionne Flutter — **décision projet
actuelle : React + TypeScript + Vite**, voir `CLAUDE.md` racine), BDD PostgreSQL.
