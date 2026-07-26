import { apiClient } from '@/lib/apiClient';
import type {
  DomaineOption,
  Habit,
  HabitRequest,
  PageResponse,
} from '@/features/habits/types/habit.types';

export const habitService = {
  // Duplique volontairement l'appel /api/domaines plutôt que d'importer une autre
  // feature — chaque feature reste indépendante (voir frontend-workflow.md).
  listDomaines: (): Promise<DomaineOption[]> => apiClient.get<DomaineOption[]>('/domaines'),

  listHabits: (): Promise<PageResponse<Habit>> =>
    apiClient.get<PageResponse<Habit>>('/habits?page=0&size=100'),

  createHabit: (request: HabitRequest): Promise<Habit> =>
    apiClient.post<Habit>('/habits', request),

  checkHabit: (id: number): Promise<Habit> => apiClient.post<Habit>(`/habits/${id}/check`),

  cancelHabitDay: (id: number, date: string): Promise<Habit> =>
    apiClient.delete<Habit>(`/habits/${id}/completions/${date}`),

  checkHabitDay: (id: number, date: string): Promise<Habit> =>
    apiClient.post<Habit>(`/habits/${id}/completions/${date}`),
};
