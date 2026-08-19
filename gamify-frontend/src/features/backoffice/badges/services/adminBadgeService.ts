import { apiClient } from '@/lib/apiClient';
import type {
  BadgeDefinition,
  BadgeDefinitionRequest,
  DomaineOption,
  PageResponse,
} from '@/features/backoffice/badges/types/adminBadge.types';

export const adminBadgeService = {
  list: (domaineId: number | undefined, page = 0, size = 20): Promise<PageResponse<BadgeDefinition>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (domaineId !== undefined) params.set('domaineId', String(domaineId));
    return apiClient.get<PageResponse<BadgeDefinition>>(`/backoffice/badges?${params.toString()}`);
  },

  create: (request: BadgeDefinitionRequest): Promise<BadgeDefinition> =>
    apiClient.post<BadgeDefinition>('/backoffice/badges', request),

  update: (id: number, request: BadgeDefinitionRequest): Promise<BadgeDefinition> =>
    apiClient.put<BadgeDefinition>(`/backoffice/badges/${id}`, request),

  deactivate: (id: number): Promise<BadgeDefinition> =>
    apiClient.delete<BadgeDefinition>(`/backoffice/badges/${id}`),

  // Domaines pour le select du formulaire (voir DomaineOption).
  listDomaines: (): Promise<PageResponse<DomaineOption>> =>
    apiClient.get<PageResponse<DomaineOption>>('/backoffice/domaines?page=0&size=100'),
};
