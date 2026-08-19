import { useEffect, useState } from 'react';
import { adminUserService } from '@/features/backoffice/users/services/adminUserService';
import type {
  AdminUserStats,
  PageResponse,
  SortBy,
  UserRank,
} from '@/features/backoffice/users/types/adminUser.types';

const PAGE_SIZE = 20;

interface UseAdminUsersReturn {
  users: UserRank[];
  stats: AdminUserStats | null;
  page: number;
  totalPages: number;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useAdminUsers = (): UseAdminUsersReturn => {
  const [sortBy, setSortBy] = useState<SortBy>('xpTotal');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<UserRank> | null>(null);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        const data = await adminUserService.ranking(sortBy, page, PAGE_SIZE);
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
  }, [sortBy, page]);

  const changeSortBy = (next: SortBy) => {
    setSortBy(next);
    setPage(0);
  };

  return {
    users: pageData?.content ?? [],
    stats,
    page,
    totalPages: pageData?.totalPages ?? 0,
    sortBy,
    setSortBy: changeSortBy,
    setPage,
    isLoading,
    error,
  };
};
