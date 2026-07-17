import { useCallback, useEffect, useState } from 'react';
import { habitService } from '@/features/habits/services/habitService';
import type { Habit, PageResponse } from '@/features/habits/types/habit.types';

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
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

  return { habits: page?.content ?? [], isLoading, error, refetch };
};
