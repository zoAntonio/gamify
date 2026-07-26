import { useState } from 'react';
import type { FC } from 'react';
import { Modal } from '@/components/ui/Modal';
import { addDays, formatMonthYear, startOfMonth, startOfWeek, toIsoDate } from '@/features/habits/utils/date';
import type { Habit } from '@/features/habits/types/habit.types';

interface HabitDetailModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onToggleDate: (id: number, date: string) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const FALLBACK_COLOR = '#663af3'; // Void Violet — si l'habitude n'a pas de couleur

/** Modale de détail : calendrier mensuel navigable, clic sur une date pour cocher/annuler. */
export const HabitDetailModal: FC<HabitDetailModalProps> = ({ habit, isOpen, onClose, onToggleDate }) => {
  const [viewedMonth, setViewedMonth] = useState(() => new Date());

  const couleur = habit.couleur ?? FALLBACK_COLOR;
  const gridStart = startOfWeek(startOfMonth(viewedMonth));
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const todayIso = toIsoDate(new Date());
  const done = new Set(habit.completions);

  const shiftMonth = (delta: number) =>
    setViewedMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <Modal isOpen={isOpen} title={habit.nom} onClose={onClose}>
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => shiftMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-control text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
        >
          ‹
        </button>
        <span className="text-[14px] font-medium capitalize text-text">{formatMonthYear(viewedMonth)}</span>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => shiftMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-control text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-1 text-center text-[11px] font-medium text-text-muted">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayIso = toIsoDate(day);
          const isCurrentMonth = day.getMonth() === viewedMonth.getMonth();
          const isFuture = dayIso > todayIso;
          const isDone = done.has(dayIso);

          return (
            <button
              key={dayIso}
              type="button"
              disabled={isFuture}
              onClick={() => onToggleDate(habit.id, dayIso)}
              aria-label={`${dayIso}${isDone ? ' — cochée, cliquer pour annuler' : ' — cliquer pour cocher'}`}
              className={[
                'flex aspect-square items-center justify-center rounded-control text-[13px] transition-colors',
                isFuture ? 'cursor-not-allowed text-text-faint/50' : 'hover:bg-surface-2',
                isCurrentMonth ? '' : 'opacity-40',
              ].join(' ')}
              style={isDone ? { backgroundColor: couleur, color: '#05060f', fontWeight: 600 } : undefined}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
