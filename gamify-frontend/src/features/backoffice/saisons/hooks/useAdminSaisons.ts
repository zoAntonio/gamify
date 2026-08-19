import { useCallback, useEffect, useState } from 'react';
import { adminSaisonService } from '@/features/backoffice/saisons/services/adminSaisonService';
import type { PageResponse, Saison } from '@/features/backoffice/saisons/types/adminSaison.types';

interface UseAdminSaisonsReturn {
  saisons: Saison[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAdminSaisons = (): UseAdminSaisonsReturn => {
  const [page, setPage] = useState<PageResponse<Saison> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await adminSaisonService.list(0, 100);
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

  return { saisons: page?.content ?? [], isLoading, error, refetch };
};
