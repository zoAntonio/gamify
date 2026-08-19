import type { FC } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminUsers } from '@/features/backoffice/users/hooks/useAdminUsers';
import { AdminUserRanking } from '@/features/backoffice/users/components/AdminUserRanking';
import { AdminUserStatsCard } from '@/features/backoffice/users/components/AdminUserStatsCard';
import type { SortBy } from '@/features/backoffice/users/types/adminUser.types';

export const AdminUsersPage: FC = () => {
  const { users, stats, page, totalPages, sortBy, setSortBy, setPage, isLoading, error } = useAdminUsers();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Utilisateurs</h1>
        <p className="mt-1 text-[15px] text-text-muted">Nombre d'inscrits et classement par performance.</p>
      </div>

      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {stats && <AdminUserStatsCard stats={stats} />}

      <div className="max-w-xs">
        <Select
          id="admin-users-sort"
          label="Trier par"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="xpTotal">XP total</option>
          <option value="niveau">Niveau</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          <AdminUserRanking users={users} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
};
