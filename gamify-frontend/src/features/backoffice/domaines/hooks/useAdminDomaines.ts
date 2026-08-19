import { useCallback, useEffect, useState } from 'react';
import { adminDomaineService } from '@/features/backoffice/domaines/services/adminDomaineService';
import type {
  AdminDomaine,
  PageResponse,
} from '@/features/backoffice/domaines/types/adminDomaine.types';

interface UseAdminDomainesReturn {
  domaines: AdminDomaine[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAdminDomaines = (): UseAdminDomainesReturn => {
  const [page, setPage] = useState<PageResponse<AdminDomaine> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await adminDomaineService.list(0, 100);
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

  return { domaines: page?.content ?? [], isLoading, error, refetch };
};
