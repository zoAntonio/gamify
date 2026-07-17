import type { FC } from 'react';
import type { JournalEntry } from '@/features/dashboard/types/stats.types';

interface JournalDuJourProps {
  entries: JournalEntry[];
}

export const JournalDuJour: FC<JournalDuJourProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-text-faint">
        Rien aujourd'hui pour l'instant — valide une tâche ou coche une habitude.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 text-[13px]">
          <span
            className={[
              'w-16 shrink-0 rounded-input px-1.5 py-0.5 text-center font-semibold tabular-nums',
              entry.delta >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
            ].join(' ')}
          >
            {entry.attribut
              ? `${entry.delta >= 0 ? '+' : ''}${entry.delta} ${entry.attribut}`
              : `+${entry.xpGagne} XP`}
          </span>
          <span className="min-w-0 flex-1 truncate text-text">{entry.source}</span>
          <span className="shrink-0 tabular-nums text-text-faint">{entry.date.slice(11, 16)}</span>
        </li>
      ))}
    </ul>
  );
};
