import type { FC } from 'react';
import { eventColorClasses } from '@/features/agenda/utils/eventColor';
import {
  addDays,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toIsoDate,
} from '@/features/agenda/utils/date';
import type { AgendaEvent } from '@/features/agenda/types/agenda.types';

interface MonthViewProps {
  currentDate: Date;
  events: AgendaEvent[];
  onSelectDay: (day: Date) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MAX_CHIPS = 3;

export const MonthView: FC<MonthViewProps> = ({ currentDate, events, onSelectDay }) => {
  const gridStart = startOfWeek(startOfMonth(currentDate));
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const now = new Date();

  return (
    <div className="rounded-card bg-surface-2 p-2">
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-2 text-center text-[12px] font-medium text-text-muted">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-input bg-border">
        {days.map((day) => {
          const dayIso = toIsoDate(day);
          const dayEvents = events.filter((event) => event.dateDebut.startsWith(dayIso));
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          return (
            <button
              key={dayIso}
              type="button"
              onClick={() => onSelectDay(day)}
              className={[
                'flex min-h-20 flex-col items-stretch gap-0.5 bg-bg p-1 text-left transition-colors hover:bg-surface-2',
                isCurrentMonth ? '' : 'opacity-40',
              ].join(' ')}
            >
              <span
                className={[
                  'self-end rounded-full px-1.5 text-[11px]',
                  isSameDay(day, now) ? 'bg-accent font-semibold text-white' : 'text-text-faint',
                ].join(' ')}
              >
                {day.getDate()}
              </span>

              {dayEvents.slice(0, MAX_CHIPS).map((event) => (
                <span
                  key={event.id}
                  className={[
                    'truncate rounded-[3px] border-l-2 px-1 text-[10px] leading-4',
                    eventColorClasses(event),
                  ].join(' ')}
                >
                  {event.titre}
                </span>
              ))}

              {dayEvents.length > MAX_CHIPS && (
                <span className="px-1 text-[10px] text-text-faint">
                  +{dayEvents.length - MAX_CHIPS}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
