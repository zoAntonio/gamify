import { apiClient } from '@/lib/apiClient';
import type {
  AdminUserStats,
  PageResponse,
  SortBy,
  UserRank,
} from '@/features/backoffice/users/types/adminUser.types';

export const adminUserService = {
  ranking: (sortBy: SortBy, page = 0, size = 20, search = ''): Promise<PageResponse<UserRank>> => {
    const params = new URLSearchParams({ sortBy, page: String(page), size: String(size) });
    if (search.trim()) params.set('search', search.trim());
    return apiClient.get<PageResponse<UserRank>>(`/backoffice/users?${params.toString()}`);
  },

  stats: (): Promise<AdminUserStats> => apiClient.get<AdminUserStats>('/backoffice/users/stats'),
};
