import type { Attribut } from '@/types/attribut.types';

export type Frequence = 'QUOTIDIEN' | 'HEBDOMADAIRE' | 'MENSUEL';

export type StatutKanban = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

export interface Activity {
  id: number;
  nom: string;
  domaineId: number | null;
  domaineNom: string | null;
  attributCible: Attribut;
  frequence: Frequence;
  objectif: string | null;
  xpRecompense: number;
  statut: StatutKanban;
  completedAt: string | null;
  // Chemin /uploads/... de la photo preuve (G2-T16) — null si aucune. Sa présence
  // signifie que le bonus +2 (au lieu de +1) a été appliqué à la validation.
  photoUrl: string | null;
}

export interface ActivityRequest {
  nom: string;
  domaineId: number;
  attributCible: Attribut;
  frequence: Frequence;
  objectif?: string;
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

// "échéance" volontairement absent : Activity n'a pas de champ date d'échéance
// (voir roadmap.md, dette G1-T09) — seuls createdAt/statut sont triables.
export type ActivitySortBy = 'createdAt' | 'statut';
export type SortDirection = 'asc' | 'desc';
// Combinaisons exposées à l'utilisateur ; '' = pas de tri (ordre naturel backend).
export type ActivitySort = `${ActivitySortBy},${SortDirection}` | '';
