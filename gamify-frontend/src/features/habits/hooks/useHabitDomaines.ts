import { useEffect, useState } from 'react';
import { habitService } from '@/features/habits/services/habitService';
import type { DomaineOption } from '@/features/habits/types/habit.types';

interface UseHabitDomainesReturn {
  domaines: DomaineOption[];
  isLoading: boolean;
}

export const useHabitDomaines = (): UseHabitDomainesReturn => {
  const [domaines, setDomaines] = useState<DomaineOption[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    habitService
      .listDomaines()
      .then((data) => {
        if (!cancelled) setDomaines(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { domaines, isLoading };
};
