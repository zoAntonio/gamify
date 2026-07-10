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
