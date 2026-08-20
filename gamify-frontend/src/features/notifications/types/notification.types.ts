export interface NotificationPreferences {
  rappelActif: boolean;
  finJourneeActif: boolean;
  celebrationActif: boolean;
}

export type ToastVariant = 'rappel' | 'finJournee' | 'celebration';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message: string;
}

// Formes minimales des réponses /api/profile, /api/badges/me et /api/agenda
// utiles au moteur de détection (features/notifications/hooks/useNotificationEngine.ts).
// Dupliquées volontairement depuis les features profile/agenda plutôt
// qu'importées — indépendance des features (voir frontend-workflow.md, même
// choix déjà fait par agenda/ pour /api/activities et habits/ pour /api/domaines).
export interface ProfileSnapshot {
  niveau: number;
  titre: string;
}

export interface BadgeSnapshot {
  id: number;
  badgeNom: string;
  palier: 'BRONZE' | 'ARGENT' | 'OR';
}

export interface AgendaEventSnapshot {
  id: number;
  titre: string;
  dateDebut: string; // LocalDateTime ISO sans fuseau
  dateFin: string;
  activityId: number | null;
  activityStatut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | null;
}

export interface PageResponse<T> {
  content: T[];
}
