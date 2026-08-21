import type { FC } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useRankingFilters } from '@/features/social/hooks/useRankingFilters';
import { useRanking } from '@/features/social/hooks/useRanking';
import { RankingFilters } from '@/features/social/components/RankingFilters';
import { RankingTable } from '@/features/social/components/RankingTable';
import type { Attribut } from '@/types/attribut.types';

// Dupliqué volontairement (même logique que RankingFilters) — juste pour
// l'unité affichée à côté de la valeur d'attribut dans le tableau.
const ATTRIBUT_LABELS: Record<Attribut, string> = {
  INT: 'INT',
  FOR: 'FOR',
  VIT: 'VIT',
  PRE: 'PRE',
  CHA: 'CHA',
  RES: 'RES',
};

export const RankingPage: FC = () => {
  const filters = useRankingFilters();
  const { entries, totalPages, isLoading, error } = useRanking(filters);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Classement</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Uniquement les joueurs ayant choisi de rendre leur profil public (
          <a href="/settings/confidentialite" className="text-accent underline">
            réglages de confidentialité
          </a>
          ).
        </p>
      </div>

      <RankingFilters
        attribut={filters.attribut}
        sortBy={filters.sortBy}
        onAttributChange={filters.setAttribut}
        onSortByChange={filters.setSortBy}
      />

      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {!isLoading && !error && (
        <>
          <RankingTable entries={entries} attributLabel={filters.attribut ? ATTRIBUT_LABELS[filters.attribut] : null} />
          <Pagination page={filters.page} totalPages={totalPages} onPageChange={filters.setPage} />
        </>
      )}
    </section>
  );
};
