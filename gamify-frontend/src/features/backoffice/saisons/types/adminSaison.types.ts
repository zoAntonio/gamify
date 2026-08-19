export interface Saison {
  id: number;
  nom: string;
  dateDebut: string; // LocalDate ISO (YYYY-MM-DD)
  dateFin: string;
  cloturee: boolean;
}

export interface CreateSaisonRequest {
  nom: string;
  dateDebut: string;
  dateFin: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
