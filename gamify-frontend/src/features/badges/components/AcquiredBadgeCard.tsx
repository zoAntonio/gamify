import type { FC } from 'react';
import { PALIER_LABELS } from '@/features/badges/lib/palier';
import type { AcquiredBadge } from '@/features/badges/types/badge.types';

interface AcquiredBadgeCardProps {
  badge: AcquiredBadge;
}

// Badge acquis, "mis en avant" (AC G2-T15) : même habillage que le toast de
// célébration au déblocage (border-success/bg-success, voir NotificationToast) —
// seul l'accent chromatique success signale un badge gagné dans ce thème sobre.
export const AcquiredBadgeCard: FC<AcquiredBadgeCardProps> = ({ badge }) => {
  const dateLabel = new Date(badge.dateObtention).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-2 rounded-card border border-success bg-success/15 p-4 shadow-glass">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-success px-2 py-0.5 text-[11px] font-semibold uppercase text-white">
          {PALIER_LABELS[badge.palier]}
        </span>
        <span aria-hidden="true" className="text-lg leading-none">
          🏅
        </span>
      </div>
      <p className="font-display text-[16px] font-medium text-heading">{badge.badgeNom}</p>
      <p className="text-[13px] text-text-muted">{badge.domaineNom}</p>
      <p className="text-[11px] text-text-faint">
        {badge.saisonNom} · obtenu le {dateLabel}
      </p>
    </div>
  );
};
