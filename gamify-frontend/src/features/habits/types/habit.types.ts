import type { Attribut } from '@/types/attribut.types';

export interface Habit {
  id: number;
  nom: string;
  domaineId: number | null;
  domaineNom: string | null;
  attributCible: Attribut;
  icone: string | null;
  couleur: string | null;
  xpRecompense: number;
  streakCourant: number;
  meilleurStreak: number;
  faitAujourdhui: boolean;
  /** Dates ISO (yyyy-MM-dd) cochées sur les 84 derniers jours — la grille 12 semaines. */
  completions: string[];
}

export interface HabitRequest {
  nom: string;
  domaineId: number;
  attributCible: Attribut;
  icone?: string;
  couleur?: string;
}

export interface DomaineOption {
  id: number;
  nom: string;
  attributs: Attribut[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
