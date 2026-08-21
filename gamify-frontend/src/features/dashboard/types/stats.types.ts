import type { Attribut } from '@/types/attribut.types';

export type PeriodeStats = 'SEMAINE' | 'MOIS' | 'ANNEE';

export interface StatsOverview {
  username: string;
  avatar: string | null;
  avatarUrl: string | null;
  niveau: number;
  titre: string;
  xpTotal: number;
  xpProchainNiveau: number;
  attributs: Record<Attribut, number>;
}

export interface PointProgression {
  label: string;
  date: string;
  gainsAttributs: number;
  /** Pertes de points d'attributs (malus d'inactivité, G1-T04), en valeur absolue. */
  pertesAttributs: number;
  xpGagne: number;
}

export interface JournalEntry {
  id: number;
  attribut: Attribut | null;
  delta: number;
  source: string;
  xpGagne: number;
  date: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Sous-ensemble minimal de UserBadgeResponse (GET /api/badges/me) utile à la carte
// "Dernier badge" du tableau de bord — dupliqué volontairement plutôt qu'importé
// depuis features/badges (indépendance des features, même choix que
// notification.types.ts pour ce même endpoint).
export interface LastBadge {
  id: number;
  badgeNom: string;
  palier: 'BRONZE' | 'ARGENT' | 'OR';
  domaineNom: string;
  dateObtention: string;
}
