import type { FC } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useActivityFeed } from '@/features/social/hooks/useActivityFeed';
import { ActivityFeedList } from '@/features/social/components/ActivityFeedList';

export const ActivityFeedPage: FC = () => {
  const { entries, page, totalPages, setPage, isLoading, error } = useActivityFeed();

  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Fil d'activité</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Actions récentes des joueurs au profil public (
          <a href="/settings/confidentialite" className="text-accent underline">
            réglages de confidentialité
          </a>
          ).
        </p>
      </div>

      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && !error && (
        <>
          <ActivityFeedList entries={entries} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
};
