import { apiClient } from '@/lib/apiClient';
import type { Attribut } from '@/types/attribut.types';
import type {
  ActivityFeedEntry,
  ClassementSortBy,
  PageResponse,
  PrivacyPreferences,
  RankEntry,
} from '@/features/social/types/social.types';

export const socialService = {
  classement: (
    sortBy: ClassementSortBy,
    attribut: Attribut | null,
    page = 0,
    size = 20,
  ): Promise<PageResponse<RankEntry>> => {
    const params = new URLSearchParams({ sortBy, page: String(page), size: String(size) });
    if (attribut) params.set('attribut', attribut);
    return apiClient.get<PageResponse<RankEntry>>(`/social/classement?${params.toString()}`);
  },

  filActivite: (page = 0, size = 20): Promise<PageResponse<ActivityFeedEntry>> =>
    apiClient.get<PageResponse<ActivityFeedEntry>>(`/social/fil-activite?page=${page}&size=${size}`),

  getPrivacyPreferences: (): Promise<PrivacyPreferences> => apiClient.get<PrivacyPreferences>('/privacy-preferences'),

  updatePrivacyPreferences: (preferences: PrivacyPreferences): Promise<PrivacyPreferences> =>
    apiClient.put<PrivacyPreferences>('/privacy-preferences', preferences),
};
