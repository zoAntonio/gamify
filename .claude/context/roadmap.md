# Roadmap / Backlog Gamify

Condensé de `docs/Gamify_Sprint_Backlog.pdf` (généré 04/07/2026). Le backlog est
écrit pour une équipe de 6 devs ; en solo, sert surtout de **découpage fonctionnel
et d'ordre de dépendance conseillé**, pas d'allocation réelle de devs.

Charge totale estimée (référence, pas contraignante en solo) : 19 jours-homme.

## Phases

- **Phase 0** — Socle applicatif et authentification
- **Phase 1** — MVP jouable (attributs, tâches/kanban, agenda/habitudes, avatar/animations)
- **Phase 2** — Fonctionnalités avancées (badges, photos preuve, multi-utilisateurs, recette)

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
