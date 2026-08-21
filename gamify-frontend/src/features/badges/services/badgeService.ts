import { apiClient } from '@/lib/apiClient';
import type { AcquiredBadge, LockedBadge } from '@/features/badges/types/badge.types';

export const badgeService = {
  getMesBadges: (): Promise<AcquiredBadge[]> => apiClient.get<AcquiredBadge[]>('/badges/me'),

  getBadgesADebloquer: (): Promise<LockedBadge[]> => apiClient.get<LockedBadge[]>('/badges/a-debloquer'),
};
