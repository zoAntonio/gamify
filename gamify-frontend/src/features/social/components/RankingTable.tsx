import type { FC } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import type { RankEntry } from '@/features/social/types/social.types';

interface RankingTableProps {
  entries: RankEntry[];
  attributLabel: string | null;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const RankingTable: FC<RankingTableProps> = ({ entries, attributLabel }) => {
  const username = useAuthStore((state) => state.username);

  if (entries.length === 0) {
    return (
      <p className="rounded-control bg-surface p-6 text-center text-[15px] text-text-muted shadow-glass">
        Personne à afficher ici pour l'instant — sois le premier à rendre ton profil public
        (Confidentialité) pour apparaître dans ce classement.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-control bg-surface shadow-glass">
      {entries.map((entry) => (
        <li
          key={entry.userId}
          className={[
            'flex items-center gap-4 px-4 py-3',
            entry.username === username ? 'bg-accent-soft' : '',
          ].join(' ')}
        >
          <span className="w-8 shrink-0 text-[15px] font-semibold text-text-muted">
            {MEDALS[entry.rang] ?? `#${entry.rang}`}
          </span>
          <span className="flex-1 text-[15px] text-text">{entry.username}</span>
          <span className="text-[13px] text-text-muted">Niveau {entry.niveau}</span>
          <span className="w-24 shrink-0 text-right text-[15px] font-medium text-heading">
            {entry.valeurAttribut !== null ? `${entry.valeurAttribut} ${attributLabel ?? ''}` : `${entry.xpTotal} XP`}
          </span>
        </li>
      ))}
    </ul>
  );
};
