import { useEffect, useState } from 'react';
import { socialService } from '@/features/social/services/socialService';
import type { ActivityFeedEntry, PageResponse } from '@/features/social/types/social.types';

const PAGE_SIZE = 20;

interface UseActivityFeedReturn {
  entries: ActivityFeedEntry[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
}

// Pagination locale (pas d'intérêt à la partager par URL, contrairement au
// classement filtrable) — même patron que useAdminUsers côté page/état.
export const useActivityFeed = (): UseActivityFeedReturn => {
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<ActivityFeedEntry> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    socialService
      .filActivite(page, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) setPageData(data);
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
  }, [page]);

  return {
    entries: pageData?.content ?? [],
    page,
    totalPages: pageData?.totalPages ?? 0,
    setPage,
    isLoading,
    error,
  };
};
