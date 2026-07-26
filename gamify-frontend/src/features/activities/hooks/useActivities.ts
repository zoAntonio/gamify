import { useCallback, useEffect, useState } from 'react';
import { activityService } from '@/features/activities/services/activityService';
import { runOptimistic } from '@/utils/optimistic';
import type { Activity, PageResponse, StatutKanban } from '@/features/activities/types/activity.types';

interface UseActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  changerStatutOptimistic: (id: number, statut: StatutKanban) => Promise<Error | null>;
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
        // Le board kanban affiche tout d'un coup — taille large plutôt que pagination UI.
        const data = await activityService.listActivities({ size: 100 });
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

  // Optimistic UI : la carte saute de colonne immédiatement, rollback si l'appel échoue.
  const changerStatutOptimistic = useCallback(
    async (id: number, statut: StatutKanban): Promise<Error | null> => {
      if (!page) return null;
      const target = page.content.find((activity) => activity.id === id);
      if (!target || target.statut === statut) return null;

      const optimisticPage: PageResponse<Activity> = {
        ...page,
        content: page.content.map((activity) => (activity.id === id ? { ...activity, statut } : activity)),
      };

      return runOptimistic(page, setPage, optimisticPage, async () => {
        const updated = await activityService.changerStatut(id, statut);
        setPage((current) =>
          current
            ? { ...current, content: current.content.map((activity) => (activity.id === id ? updated : activity)) }
            : current,
        );
      });
    },
    [page],
  );

  return { activities: page?.content ?? [], isLoading, error, refetch, changerStatutOptimistic };
};
