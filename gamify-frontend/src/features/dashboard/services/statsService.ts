import { apiClient } from '@/lib/apiClient';
import type {
  JournalEntry,
  LastBadge,
  PageResponse,
  PeriodeStats,
  PointProgression,
  StatsOverview,
} from '@/features/dashboard/types/stats.types';

export const statsService = {
  // Duplique volontairement l'appel /api/profile — pas de dépendance
  // cross-feature (frontend-workflow.md).
  getOverview: (): Promise<StatsOverview> => apiClient.get<StatsOverview>('/profile'),

  getProgression: (periode: PeriodeStats): Promise<PointProgression[]> =>
    apiClient.get<PointProgression[]>(`/stats/progression?periode=${periode}`),

  getJournal: (): Promise<PageResponse<JournalEntry>> =>
    apiClient.get<PageResponse<JournalEntry>>('/stats/journal?page=0&size=20'),

  // Duplique volontairement /api/badges/me (déjà appelé par features/badges et
  // features/notifications) — même sous-ensemble minimal (id/nom/palier/domaine/
  // date), trié par date d'obtention desc côté backend : le premier élément est
  // le dernier badge débloqué.
  getBadges: (): Promise<LastBadge[]> => apiClient.get<LastBadge[]>('/badges/me'),
};
