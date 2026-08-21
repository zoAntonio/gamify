import { useEffect, useState } from 'react';
import { socialService } from '@/features/social/services/socialService';
import type { ClassementSortBy, PageResponse, RankEntry } from '@/features/social/types/social.types';
import type { Attribut } from '@/types/attribut.types';

const PAGE_SIZE = 20;

interface UseRankingParams {
  sortBy: ClassementSortBy;
  attribut: Attribut | null;
  page: number;
}

interface UseRankingReturn {
  entries: RankEntry[];
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

// Purement une source de données pour les params déjà résolus par
// useRankingFilters — même découpage que useActivities/useActivityFilters.
export const useRanking = ({ sortBy, attribut, page }: UseRankingParams): UseRankingReturn => {
  const [pageData, setPageData] = useState<PageResponse<RankEntry> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    socialService
      .classement(sortBy, attribut, page, PAGE_SIZE)
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
  }, [sortBy, attribut, page]);

  return {
    entries: pageData?.content ?? [],
    totalPages: pageData?.totalPages ?? 0,
    isLoading,
    error,
  };
};
