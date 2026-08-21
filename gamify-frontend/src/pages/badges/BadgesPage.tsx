import type { FC } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { AcquiredBadgeCard } from '@/features/badges/components/AcquiredBadgeCard';
import { LockedBadgeCard } from '@/features/badges/components/LockedBadgeCard';
import { useBadgeGallery } from '@/features/badges/hooks/useBadgeGallery';
import type { AcquiredBadge } from '@/features/badges/types/badge.types';

// Groupe par saison en conservant l'ordre "le plus récent d'abord" déjà renvoyé
// par l'API (GET /api/badges/me, tri par dateObtention desc côté backend).
const groupBySaison = (badges: AcquiredBadge[]): Array<[string, AcquiredBadge[]]> => {
  const groups = new Map<string, AcquiredBadge[]>();
  for (const badge of badges) {
    const group = groups.get(badge.saisonNom);
    if (group) {
      group.push(badge);
    } else {
      groups.set(badge.saisonNom, [badge]);
    }
  }
  return Array.from(groups.entries());
};

export const BadgesPage: FC = () => {
  const { acquis, aDebloquer, isLoading, error } = useBadgeGallery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (error) {
    return <p className="text-[15px] text-danger">{error.message}</p>;
  }

  const groupesAcquis = groupBySaison(acquis);

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Badges</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Bronze, Argent, Or : un badge par palier et par domaine, à débloquer en validant tâches et habitudes.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="font-display text-[18px] font-medium text-heading">Badges acquis</h2>
        {groupesAcquis.length === 0 ? (
          <p className="text-[15px] text-text-muted">Aucun badge débloqué pour le moment.</p>
        ) : (
          groupesAcquis.map(([saisonNom, badges]) => (
            <div key={saisonNom} className="flex flex-col gap-3">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-faint">
                {saisonNom}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map((badge) => (
                  <AcquiredBadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-[18px] font-medium text-heading">Badges à débloquer</h2>
        {aDebloquer.length === 0 ? (
          <p className="text-[15px] text-text-muted">
            Rien à débloquer pour le moment (aucune saison active, ou catalogue déjà complété).
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aDebloquer.map((badge) => (
              <LockedBadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
