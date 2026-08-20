import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Attribut } from '@/types/attribut.types';
import type { ActivitySort } from '@/features/activities/types/activity.types';

const VALID_ATTRIBUTS: Attribut[] = ['INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES'];
const VALID_SORTS: ActivitySort[] = ['createdAt,asc', 'createdAt,desc', 'statut,asc', 'statut,desc'];

interface UseActivityFiltersReturn {
  domaineId: number | null;
  attributCible: Attribut | null;
  sort: ActivitySort;
  hasActiveFilters: boolean;
  setDomaineId: (value: number | null) => void;
  setAttributCible: (value: Attribut | null) => void;
  setSort: (value: ActivitySort) => void;
  resetFilters: () => void;
}

// État des filtres/tri porté par l'URL (query params) plutôt que par un useState local :
// partageable/rafraîchissable sans perdre la sélection (G1-T09).
export const useActivityFilters = (): UseActivityFiltersReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const domaineIdParam = searchParams.get('domaine');
  const domaineId =
    domaineIdParam !== null && Number.isFinite(Number(domaineIdParam)) ? Number(domaineIdParam) : null;

  const attributParam = searchParams.get('attribut');
  const attributCible = VALID_ATTRIBUTS.includes(attributParam as Attribut) ? (attributParam as Attribut) : null;

  const sortParam = searchParams.get('sort');
  const sort = VALID_SORTS.includes(sortParam as ActivitySort) ? (sortParam as ActivitySort) : '';

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setDomaineId = useCallback(
    (value: number | null) => updateParam('domaine', value !== null ? String(value) : null),
    [updateParam],
  );
  const setAttributCible = useCallback((value: Attribut | null) => updateParam('attribut', value), [updateParam]);
  const setSort = useCallback((value: ActivitySort) => updateParam('sort', value), [updateParam]);

  const resetFilters = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('domaine');
        next.delete('attribut');
        next.delete('sort');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const hasActiveFilters = domaineId !== null || attributCible !== null || sort !== '';

  return { domaineId, attributCible, sort, hasActiveFilters, setDomaineId, setAttributCible, setSort, resetFilters };
};
