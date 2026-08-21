import { useEffect, useState } from 'react';
import { adminUserService } from '@/features/backoffice/users/services/adminUserService';
import type {
  AdminUserStats,
  PageResponse,
  SortBy,
  UserRank,
} from '@/features/backoffice/users/types/adminUser.types';

const PAGE_SIZE = 20;
// Le temps d'attente après la dernière frappe avant d'interroger l'API — évite
// une requête par caractère tapé dans le champ de recherche.
const SEARCH_DEBOUNCE_MS = 300;

interface UseAdminUsersReturn {
  users: UserRank[];
  stats: AdminUserStats | null;
  page: number;
  totalPages: number;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  search: string;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [sortBy, setSortBy] = useState<SortBy>('xpTotal');
  const [search, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<UserRank> | null>(null);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  // Le nombre total d'utilisateurs ne dépend ni de la page ni du tri : un seul
  // appel au montage suffit, pas besoin de le refaire à chaque changement de page.
  useEffect(() => {
    let cancelled = false;
    adminUserService
      .stats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await adminUserService.ranking(sortBy, page, PAGE_SIZE, debouncedSearch);
        if (!cancelled) setPageData(data);
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
  }, [sortBy, page, debouncedSearch]);

  const changeSortBy = (next: SortBy) => {
    setSortBy(next);
    setPage(0);
  };

  const changeSearch = (next: string) => {
    setSearchInput(next);
    setPage(0);
  };

  return {
    users: pageData?.content ?? [],
    stats,
    page,
    totalPages: pageData?.totalPages ?? 0,
    sortBy,
    setSortBy: changeSortBy,
    search,
    setSearch: changeSearch,
    setPage,
    isLoading,
    error,
  };
};
