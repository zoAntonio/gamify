import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { formatMonthYear } from '@/features/agenda/utils/date';
import type { AgendaView } from '@/features/agenda/types/agenda.types';

interface AgendaHeaderProps {
  currentDate: Date;
  view: AgendaView;
  onViewChange: (view: AgendaView) => void;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
  onCreate: () => void;
}

const VIEW_LABELS: { view: AgendaView; label: string }[] = [
  { view: 'SEMAINE', label: 'Semaine' },
  { view: 'JOUR', label: 'Jour' },
  { view: 'MOIS', label: 'Mois' },
];

export const AgendaHeader: FC<AgendaHeaderProps> = ({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onToday,
  onCreate,
}) => (
  <div className="flex flex-wrap items-center gap-3">
    <h1 className="font-display text-[24px] font-medium capitalize tracking-tight text-heading">
      {formatMonthYear(currentDate)}
    </h1>

    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Période précédente"
        onClick={() => onNavigate(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-control text-text-muted shadow-subtle transition-colors hover:bg-surface-2"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Période suivante"
        onClick={() => onNavigate(1)}
        className="flex h-8 w-8 items-center justify-center rounded-control text-text-muted shadow-subtle transition-colors hover:bg-surface-2"
      >
        ›
      </button>
      <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-[13px]" onClick={onToday}>
        Aujourd'hui
      </Button>
    </div>

    <div className="ml-auto flex items-center gap-2">
      <div className="flex rounded-control bg-surface-2 p-0.5 shadow-subtle">
        {VIEW_LABELS.map((item) => (
          <button
            key={item.view}
            type="button"
            aria-pressed={view === item.view}
            onClick={() => onViewChange(item.view)}
            className={[
              'rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors',
              view === item.view ? 'bg-accent text-white' : 'text-text-muted hover:text-text',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Button type="button" onClick={onCreate}>
        + Événement
      </Button>
    </div>
  </div>
);
