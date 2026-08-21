import { useState } from 'react';
import type { FC } from 'react';
import { PlayerCard } from '@/features/dashboard/components/PlayerCard';
import { LastBadgeCard } from '@/features/dashboard/components/LastBadgeCard';
import { AttributeBars } from '@/features/dashboard/components/AttributeBars';
import { AttributeRadar } from '@/features/dashboard/components/AttributeRadar';
import { ProgressionChart } from '@/features/dashboard/components/ProgressionChart';
import { JournalDuJour } from '@/features/dashboard/components/JournalDuJour';
import { useStatsOverview } from '@/features/dashboard/hooks/useStatsOverview';
import { useProgression } from '@/features/dashboard/hooks/useProgression';
import { useJournal } from '@/features/dashboard/hooks/useJournal';
import type { PeriodeStats } from '@/features/dashboard/types/stats.types';

export const DashboardPage: FC = () => {
  const [periode, setPeriode] = useState<PeriodeStats>('SEMAINE');
  const { overview, isLoading: isLoadingOverview, error: overviewError } = useStatsOverview();
  const { points, isLoading: isLoadingProgression } = useProgression(periode);
  const { entries, isLoading: isLoadingJournal } = useJournal();

  if (isLoadingOverview) {
    return <p className="text-[15px] text-text-muted">Chargement du tableau de bord...</p>;
  }
  if (overviewError || !overview) {
    return <p className="text-[15px] text-danger">{overviewError?.message ?? 'Profil indisponible'}</p>;
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <div className="flex-1">
          <PlayerCard overview={overview} />
        </div>
        <div className="w-full lg:w-72 lg:shrink-0">
          <LastBadgeCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-card bg-surface p-5 shadow-glass">
          <h2 className="mb-4 font-display text-[16px] font-medium text-heading">Attributs</h2>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="w-full flex-1">
              <AttributeBars attributs={overview.attributs} />
            </div>
            <div className="w-full max-w-56 sm:w-56 sm:shrink-0">
              <AttributeRadar attributs={overview.attributs} />
            </div>
          </div>
        </div>

        <div className="rounded-card bg-surface p-5 shadow-glass">
          <h2 className="mb-4 font-display text-[16px] font-medium text-heading">
            Journal du jour
          </h2>
          {isLoadingJournal ? (
            <p className="text-[13px] text-text-muted">Chargement...</p>
          ) : (
            <JournalDuJour entries={entries} />
          )}
        </div>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-glass">
        {isLoadingProgression ? (
          <p className="text-[13px] text-text-muted">Chargement de la progression...</p>
        ) : (
          <ProgressionChart points={points} periode={periode} onPeriodeChange={setPeriode} />
        )}
      </div>
    </section>
  );
};
