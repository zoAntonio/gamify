import { apiClient } from '@/lib/apiClient';
import type {
  AdminUserStats,
  PageResponse,
  SortBy,
  UserRank,
} from '@/features/backoffice/users/types/adminUser.types';

export const adminUserService = {
  ranking: (sortBy: SortBy, page = 0, size = 20): Promise<PageResponse<UserRank>> =>
    apiClient.get<PageResponse<UserRank>>(`/backoffice/users?sortBy=${sortBy}&page=${page}&size=${size}`),

  stats: (): Promise<AdminUserStats> => apiClient.get<AdminUserStats>('/backoffice/users/stats'),
};
