import { useEffect, useState } from 'react';
import { statsService } from '@/features/dashboard/services/statsService';
import type { LastBadge } from '@/features/dashboard/types/stats.types';

interface UseLastBadgeResult {
  badge: LastBadge | null;
  isLoading: boolean;
}

/** Dernier badge débloqué (le plus récent, toutes saisons) pour la carte du tableau de bord. */
export const useLastBadge = (): UseLastBadgeResult => {
  const [badge, setBadge] = useState<LastBadge | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    statsService
      .getBadges()
      .then((badges) => {
        if (!cancelled) setBadge(badges[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setBadge(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { badge, isLoading };
};
