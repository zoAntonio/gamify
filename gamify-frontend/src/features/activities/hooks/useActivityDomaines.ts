import { useEffect, useState } from 'react';
import { activityService } from '@/features/activities/services/activityService';
import type { DomaineOption } from '@/features/activities/types/activity.types';

interface UseActivityDomainesReturn {
  domaines: DomaineOption[];
  isLoading: boolean;
}

export const useActivityDomaines = (): UseActivityDomainesReturn => {
  const [domaines, setDomaines] = useState<DomaineOption[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    activityService
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
