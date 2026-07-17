import { useEffect, useState } from 'react';
import { statsService } from '@/features/dashboard/services/statsService';
import type { PeriodeStats, PointProgression } from '@/features/dashboard/types/stats.types';

interface UseProgressionReturn {
  points: PointProgression[];
  isLoading: boolean;
  error: Error | null;
}

export const useProgression = (periode: PeriodeStats): UseProgressionReturn => {
  const [points, setPoints] = useState<PointProgression[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    statsService
      .getProgression(periode)
      .then((data) => {
        if (!cancelled) setPoints(data);
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
  }, [periode]);

  return { points, isLoading, error };
};
