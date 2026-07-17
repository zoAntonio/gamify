export type AgendaView = 'SEMAINE' | 'JOUR' | 'MOIS';

// Dupliqué depuis la feature activities — pas de dépendance croisée entre
// features (voir frontend-workflow.md).
export type StatutKanban = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

export interface AgendaEvent {
  id: number;
  titre: string;
  /** LocalDateTime ISO sans fuseau (ex. 2026-07-18T14:00:00). */
  dateDebut: string;
  dateFin: string;
  activityId: number | null;
  activityNom: string | null;
  activityStatut: StatutKanban | null;
}

export interface AgendaEventRequest {
  titre: string;
  dateDebut: string;
  dateFin: string;
  activityId?: number;
}

export interface ActivityOption {
  id: number;
  nom: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
