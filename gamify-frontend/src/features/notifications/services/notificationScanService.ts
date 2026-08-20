import { apiClient } from '@/lib/apiClient';
import type {
  AgendaEventSnapshot,
  BadgeSnapshot,
  PageResponse,
  ProfileSnapshot,
} from '@/features/notifications/types/notification.types';

/**
 * Appels dédiés au moteur de détection (useNotificationEngine) : relit
 * `/api/profile`, `/api/badges/me` et `/api/agenda` déjà exposés par
 * d'autres features, mais sans passer par leurs services — indépendance des
 * features (frontend-workflow.md), et on ne récupère de toute façon qu'un
 * sous-ensemble des champs (voir notification.types.ts).
 */
export const notificationScanService = {
  getProfileSnapshot: (): Promise<ProfileSnapshot> => apiClient.get<ProfileSnapshot>('/profile'),

  getBadgeSnapshots: (): Promise<BadgeSnapshot[]> => apiClient.get<BadgeSnapshot[]>('/badges/me'),

  getTodayAgendaEvents: (from: string, to: string): Promise<AgendaEventSnapshot[]> =>
    apiClient
      .get<PageResponse<AgendaEventSnapshot>>(
        `/agenda?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&page=0&size=100`,
      )
      .then((page) => page.content),
};
