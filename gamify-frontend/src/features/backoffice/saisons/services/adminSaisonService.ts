import { apiClient } from '@/lib/apiClient';
import type {
  CreateSaisonRequest,
  PageResponse,
  Saison,
} from '@/features/backoffice/saisons/types/adminSaison.types';

export const adminSaisonService = {
  list: (page = 0, size = 20): Promise<PageResponse<Saison>> =>
    apiClient.get<PageResponse<Saison>>(`/backoffice/saisons?page=${page}&size=${size}`),

  create: (request: CreateSaisonRequest): Promise<Saison> =>
    apiClient.post<Saison>('/backoffice/saisons', request),

  cloturer: (id: number): Promise<Saison> => apiClient.post<Saison>(`/backoffice/saisons/${id}/cloturer`),
};
