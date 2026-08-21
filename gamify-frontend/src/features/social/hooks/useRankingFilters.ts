import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Attribut } from '@/types/attribut.types';
import type { ClassementSortBy } from '@/features/social/types/social.types';

const VALID_ATTRIBUTS: Attribut[] = ['INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES'];
const VALID_SORTS: ClassementSortBy[] = ['xpTotal', 'niveau'];

interface UseRankingFiltersReturn {
  attribut: Attribut | null;
  sortBy: ClassementSortBy;
  page: number;
  setAttribut: (value: Attribut | null) => void;
  setSortBy: (value: ClassementSortBy) => void;
  setPage: (value: number) => void;
}

// État porté par l'URL (query params) plutôt qu'un useState local — même patron
// que useActivityFilters (G1-T09), partageable/rafraîchissable sans perdre la
// sélection.
export const useRankingFilters = (): UseRankingFiltersReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const attributParam = searchParams.get('attribut');
  const attribut = VALID_ATTRIBUTS.includes(attributParam as Attribut) ? (attributParam as Attribut) : null;

  const sortByParam = searchParams.get('sortBy');
  const sortBy = VALID_SORTS.includes(sortByParam as ClassementSortBy) ? (sortByParam as ClassementSortBy) : 'xpTotal';

  const pageParam = searchParams.get('page');
  const page = pageParam !== null && Number.isFinite(Number(pageParam)) ? Math.max(0, Number(pageParam)) : 0;

  const updateParam = useCallback(
    (key: string, value: string | null, resetPage: boolean) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          // Changer le tri/l'attribut repart toujours de la première page.
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setAttribut = useCallback((value: Attribut | null) => updateParam('attribut', value, true), [updateParam]);
  const setSortBy = useCallback(
    (value: ClassementSortBy) => updateParam('sortBy', value === 'xpTotal' ? null : value, true),
    [updateParam],
  );
  const setPage = useCallback((value: number) => updateParam('page', value > 0 ? String(value) : null, false), [updateParam]);

  return { attribut, sortBy, page, setAttribut, setSortBy, setPage };
};
