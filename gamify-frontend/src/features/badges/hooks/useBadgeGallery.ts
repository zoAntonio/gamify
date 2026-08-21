import { useCallback, useEffect, useState } from 'react';
import { badgeService } from '@/features/badges/services/badgeService';
import type { AcquiredBadge, LockedBadge } from '@/features/badges/types/badge.types';

interface UseBadgeGalleryResult {
  acquis: AcquiredBadge[];
  aDebloquer: LockedBadge[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/** Charge en parallèle les deux volets de la galerie (G2-T15) : acquis + à débloquer. */
export const useBadgeGallery = (): UseBadgeGalleryResult => {
  const [acquis, setAcquis] = useState<AcquiredBadge[]>([]);
  const [aDebloquer, setADebloquer] = useState<LockedBadge[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([badgeService.getMesBadges(), badgeService.getBadgesADebloquer()])
      .then(([badgesAcquis, badgesADebloquer]) => {
        if (cancelled) return;
        setAcquis(badgesAcquis);
        setADebloquer(badgesADebloquer);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { acquis, aDebloquer, isLoading, error, refetch };
};
