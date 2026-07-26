import { useCallback, useEffect, useState } from 'react';
import { habitService } from '@/features/habits/services/habitService';
import { toIsoDate } from '@/features/habits/utils/date';
import { runOptimistic } from '@/utils/optimistic';
import type { Habit, PageResponse } from '@/features/habits/types/habit.types';

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  toggleHabit: (id: number) => Promise<Error | null>;
  cancelDay: (id: number, date: string) => Promise<Error | null>;
  checkDay: (id: number, date: string) => Promise<Error | null>;
}

export const useHabits = (): UseHabitsReturn => {
  const [page, setPage] = useState<PageResponse<Habit> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await habitService.listHabits();
        if (!cancelled) setPage(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refetchToken]);

  // Optimistic UI : coche + streak incrémentés immédiatement, rollback si l'appel échoue.
  const toggleHabit = useCallback(
    async (id: number): Promise<Error | null> => {
      if (!page) return null;
      const target = page.content.find((habit) => habit.id === id);
      if (!target || target.faitAujourdhui) return null;

      const optimisticHabit: Habit = {
        ...target,
        faitAujourdhui: true,
        streakCourant: target.streakCourant + 1,
        meilleurStreak: Math.max(target.meilleurStreak, target.streakCourant + 1),
        completions: [...target.completions, toIsoDate(new Date())],
      };
      const optimisticPage: PageResponse<Habit> = {
        ...page,
        content: page.content.map((habit) => (habit.id === id ? optimisticHabit : habit)),
      };

      return runOptimistic(page, setPage, optimisticPage, async () => {
        const updated = await habitService.checkHabit(id);
        setPage((current) =>
          current
            ? { ...current, content: current.content.map((habit) => (habit.id === id ? updated : habit)) }
            : current,
        );
      });
    },
    [page],
  );

  // Optimiste : ne fait disparaître que le carré de la grille (streak/record
  // recalculés côté serveur pour un jour arbitraire, pas devinables ici).
  const cancelDay = useCallback(
    async (id: number, date: string): Promise<Error | null> => {
      if (!page) return null;
      const target = page.content.find((habit) => habit.id === id);
      if (!target) return null;

      const optimisticHabit: Habit = {
        ...target,
        faitAujourdhui: date === toIsoDate(new Date()) ? false : target.faitAujourdhui,
        completions: target.completions.filter((iso) => iso !== date),
      };
      const optimisticPage: PageResponse<Habit> = {
        ...page,
        content: page.content.map((habit) => (habit.id === id ? optimisticHabit : habit)),
      };

      return runOptimistic(page, setPage, optimisticPage, async () => {
        const updated = await habitService.cancelHabitDay(id, date);
        setPage((current) =>
          current
            ? { ...current, content: current.content.map((habit) => (habit.id === id ? updated : habit)) }
            : current,
        );
      });
    },
    [page],
  );

  // Optimiste : ajoute la date à completions (streak/record recalculés côté
  // serveur pour un jour arbitraire, pas devinables ici — même limite que cancelDay).
  const checkDay = useCallback(
    async (id: number, date: string): Promise<Error | null> => {
      if (!page) return null;
      const target = page.content.find((habit) => habit.id === id);
      if (!target || target.completions.includes(date)) return null;

      const optimisticHabit: Habit = {
        ...target,
        faitAujourdhui: date === toIsoDate(new Date()) ? true : target.faitAujourdhui,
        completions: [...target.completions, date],
      };
      const optimisticPage: PageResponse<Habit> = {
        ...page,
        content: page.content.map((habit) => (habit.id === id ? optimisticHabit : habit)),
      };

      return runOptimistic(page, setPage, optimisticPage, async () => {
        const updated = await habitService.checkHabitDay(id, date);
        setPage((current) =>
          current
            ? { ...current, content: current.content.map((habit) => (habit.id === id ? updated : habit)) }
            : current,
        );
      });
    },
    [page],
  );

  return { habits: page?.content ?? [], isLoading, error, refetch, toggleHabit, cancelDay, checkDay };
};
