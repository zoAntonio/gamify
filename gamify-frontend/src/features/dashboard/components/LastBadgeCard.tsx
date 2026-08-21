import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useLastBadge } from '@/features/dashboard/hooks/useLastBadge';

const PALIER_LABELS: Record<'BRONZE' | 'ARGENT' | 'OR', string> = {
  BRONZE: 'Bronze',
  ARGENT: 'Argent',
  OR: 'Or',
};

export const LastBadgeCard: FC = () => {
  const { badge, isLoading } = useLastBadge();

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-5 shadow-glass">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-[16px] font-medium text-heading">Dernier badge</h2>
        <Link to="/badges" className="shrink-0 text-[13px] font-medium text-accent hover:text-accent-hover">
          Galerie →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-[13px] text-text-muted">Chargement...</p>
      ) : badge ? (
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-3xl leading-none">
            🏅
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-text">{badge.badgeNom}</p>
            <p className="text-[13px] text-text-muted">
              {PALIER_LABELS[badge.palier]} · {badge.domaineNom}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-text-muted">Aucun badge débloqué pour le moment.</p>
      )}
    </div>
  );
};
