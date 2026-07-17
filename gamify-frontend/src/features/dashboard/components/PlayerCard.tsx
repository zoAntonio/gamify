import type { FC } from 'react';
import { API_ORIGIN } from '@/lib/apiClient';
import type { StatsOverview } from '@/features/dashboard/types/stats.types';

interface PlayerCardProps {
  overview: StatsOverview;
}

const AVATAR_EMOJIS: Record<string, string> = {
  GUERRIER: '⚔️',
  MAGE: '🧙',
  ARCHER: '🏹',
  VOLEUR: '🗡️',
};

/** Même courbe que User.seuilXpPourNiveau côté backend (G1-T05). */
const seuilXpPourNiveau = (niveau: number): number => 100 * (2 ** (niveau - 1) - 1);

export const PlayerCard: FC<PlayerCardProps> = ({ overview }) => {
  const valeurs = Object.values(overview.attributs);
  const overall = Math.round(valeurs.reduce((sum, value) => sum + value, 0) / valeurs.length);

  const seuilActuel = seuilXpPourNiveau(overview.niveau);
  const progressionNiveau = Math.min(
    1,
    (overview.xpTotal - seuilActuel) / Math.max(overview.xpProchainNiveau - seuilActuel, 1),
  );

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-card bg-surface p-5 shadow-glass">
      <div className="relative shrink-0">
        {overview.avatarUrl ? (
          <img
            src={`${API_ORIGIN}${overview.avatarUrl}`}
            alt={`Avatar de ${overview.username}`}
            className="h-24 w-24 rounded-card object-cover shadow-subtle"
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-card bg-surface-2 text-[40px] shadow-subtle">
            {(overview.avatar && AVATAR_EMOJIS[overview.avatar]) ?? '✦'}
          </span>
        )}
        <span className="absolute -bottom-2 -right-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-accent px-2 text-[13px] font-semibold text-white shadow-subtle">
          {overview.niveau}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[22px] font-medium tracking-tight text-heading">
          {overview.username}
        </p>
        <p className="text-[13px] text-text-muted">
          Niveau {overview.niveau} · {overview.titre}
        </p>

        <div className="mt-3 max-w-sm">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-r-[4px] bg-accent"
              style={{ width: `${progressionNiveau * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] tabular-nums text-text-faint">
            {overview.xpTotal} / {overview.xpProchainNiveau} XP
          </p>
        </div>
      </div>

      <div className="shrink-0 text-center">
        <p className="font-display text-[44px] font-medium leading-none text-heading">{overall}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-text-faint">Général</p>
      </div>
    </div>
  );
};
