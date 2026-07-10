import { useCallback, useEffect, useState } from 'react';
import { activityService } from '@/features/activities/services/activityService';
import type { Activity, PageResponse } from '@/features/activities/types/activity.types';

interface UseActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useActivities = (): UseActivitiesReturn => {
  const [page, setPage] = useState<PageResponse<Activity> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await activityService.listActivities();
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

  return { activities: page?.content ?? [], isLoading, error, refetch };
};
