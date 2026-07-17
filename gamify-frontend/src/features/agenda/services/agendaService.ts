import { apiClient } from '@/lib/apiClient';
import type {
  ActivityOption,
  AgendaEvent,
  AgendaEventRequest,
  PageResponse,
} from '@/features/agenda/types/agenda.types';

export const agendaService = {
  listEvents: (from: string, to: string): Promise<PageResponse<AgendaEvent>> =>
    apiClient.get<PageResponse<AgendaEvent>>(
      `/agenda?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&page=0&size=100`,
    ),

  createEvent: (request: AgendaEventRequest): Promise<AgendaEvent> =>
    apiClient.post<AgendaEvent>('/agenda', request),

  updateEvent: (id: number, request: AgendaEventRequest): Promise<AgendaEvent> =>
    apiClient.put<AgendaEvent>(`/agenda/${id}`, request),

  deleteEvent: (id: number): Promise<void> => apiClient.delete<void>(`/agenda/${id}`),

  // Duplique volontairement l'appel /api/activities (pour le select "Lier à une
  // tâche") — pas de dépendance croisée entre features (frontend-workflow.md).
  listActivityOptions: (): Promise<PageResponse<ActivityOption>> =>
    apiClient.get<PageResponse<ActivityOption>>('/activities?page=0&size=100'),
};
