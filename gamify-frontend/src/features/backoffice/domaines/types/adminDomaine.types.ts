import type { Attribut } from '@/types/attribut.types';

export interface AdminDomaine {
  id: number;
  nom: string;
  attributs: Attribut[];
  systeme: boolean;
  proprietaire: string;
  actif: boolean;
}

export interface AdminDomaineRequest {
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
