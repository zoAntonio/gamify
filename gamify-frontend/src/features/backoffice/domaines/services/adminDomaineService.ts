import { apiClient } from '@/lib/apiClient';
import type {
  AdminDomaine,
  AdminDomaineRequest,
  PageResponse,
} from '@/features/backoffice/domaines/types/adminDomaine.types';

export const adminDomaineService = {
  list: (page = 0, size = 20): Promise<PageResponse<AdminDomaine>> =>
    apiClient.get<PageResponse<AdminDomaine>>(`/backoffice/domaines?page=${page}&size=${size}`),

  create: (request: AdminDomaineRequest): Promise<AdminDomaine> =>
    apiClient.post<AdminDomaine>('/backoffice/domaines', request),

  update: (id: number, request: AdminDomaineRequest): Promise<AdminDomaine> =>
    apiClient.put<AdminDomaine>(`/backoffice/domaines/${id}`, request),

  deactivate: (id: number): Promise<AdminDomaine> =>
    apiClient.delete<AdminDomaine>(`/backoffice/domaines/${id}`),
};
