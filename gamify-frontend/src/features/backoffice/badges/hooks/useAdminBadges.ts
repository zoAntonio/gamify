import { useCallback, useEffect, useState } from 'react';
import { adminBadgeService } from '@/features/backoffice/badges/services/adminBadgeService';
import type { BadgeDefinition, DomaineOption } from '@/features/backoffice/badges/types/adminBadge.types';

interface UseAdminBadgesReturn {
  badges: BadgeDefinition[];
  domaines: DomaineOption[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAdminBadges = (domaineId?: number): UseAdminBadgesReturn => {
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [domaines, setDomaines] = useState<DomaineOption[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [badgePage, domainePage] = await Promise.all([
          adminBadgeService.list(domaineId, 0, 100),
          adminBadgeService.listDomaines(),
        ]);
        if (!cancelled) {
          setBadges(badgePage.content);
          setDomaines(domainePage.content);
        }
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
  }, [domaineId, refetchToken]);

  return { badges, domaines, isLoading, error, refetch };
};
