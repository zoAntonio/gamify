import { useEffect, useState } from 'react';
import { statsService } from '@/features/dashboard/services/statsService';
import type { StatsOverview } from '@/features/dashboard/types/stats.types';

interface UseStatsOverviewReturn {
  overview: StatsOverview | null;
  isLoading: boolean;
  error: Error | null;
}

export const useStatsOverview = (): UseStatsOverviewReturn => {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    statsService
      .getOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { overview, isLoading, error };
};
