export type AgendaView = 'SEMAINE' | 'JOUR' | 'MOIS';

// Dupliqué depuis la feature activities — pas de dépendance croisée entre
// features (voir frontend-workflow.md).
export type StatutKanban = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

// Miroir de com.gamify.domain.enums.Frequence (backend), réutilisé tel quel
// pour la récurrence d'agenda — pas un nouveau vocabulaire.
export type FrequenceRecurrence = 'QUOTIDIEN' | 'HEBDOMADAIRE' | 'MENSUEL';

// Miroir des noms de java.time.DayOfWeek (backend), envoyés/reçus tels quels.
export type JourSemaine =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface RecurrenceRule {
  frequence: FrequenceRecurrence;
  /** Pertinent seulement si frequence === 'HEBDOMADAIRE'. */
  joursSemaine: JourSemaine[];
  /** yyyy-MM-dd, obligatoire — pas de récurrence infinie (décision produit). */
  finRecurrence: string;
}

export interface AgendaEvent {
  id: number;
  titre: string;
  /** LocalDateTime ISO sans fuseau (ex. 2026-07-18T14:00:00). */
  dateDebut: string;
  dateFin: string;
  activityId: number | null;
  activityNom: string | null;
  activityStatut: StatutKanban | null;
  /** null si événement libre non récurrent. */
  serieId: number | null;
  frequenceRecurrence: FrequenceRecurrence | null;
  joursSemaine: JourSemaine[];
  finRecurrence: string | null;
  /** true si cette occurrence a été éditée individuellement (hors "toute la série"). */
  detachee: boolean;
}

export interface AgendaEventRequest {
  titre: string;
  dateDebut: string;
  dateFin: string;
  activityId?: number;
  /** Absent = événement libre. Pris en compte seulement à la création. */
  recurrence?: RecurrenceRule;
}

export interface AgendaSeriesUpdateRequest {
  titre: string;
  /** LocalTime ISO, ex. "18:00:00". */
  heureDebut: string;
  heureFin: string;
  activityId?: number;
  recurrence: RecurrenceRule;
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
