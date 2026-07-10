import { useCallback, useEffect, useState } from 'react';
import { profileService } from '@/features/profile/services/profileService';
import type { Domaine } from '@/features/profile/types/profile.types';

interface UseDomainesReturn {
  domaines: Domaine[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDomaines = (): UseDomainesReturn => {
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await profileService.listDomaines();
        if (!cancelled) setDomaines(data);
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

  return { domaines, isLoading, error, refetch };
};
