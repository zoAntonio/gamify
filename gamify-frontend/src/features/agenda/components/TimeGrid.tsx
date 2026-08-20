import { useState } from 'react';
import type { DragEvent, FC } from 'react';
import { EventBlock } from '@/features/agenda/components/EventBlock';
import { formatDayLabel, isSameDay, toIsoDate } from '@/features/agenda/utils/date';
import type { AgendaEvent } from '@/features/agenda/types/agenda.types';

interface TimeGridProps {
  days: Date[];
  events: AgendaEvent[];
  onSlotClick: (day: Date, hour: number) => void;
  onEventClick: (event: AgendaEvent) => void;
  onEventDrop: (eventId: number, day: Date, hour: number) => void;
  onEventResize: (event: AgendaEvent, newDateFin: string) => void;
}

const HOUR_HEIGHT = 48;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** Grille horaire partagée : 7 colonnes en vue semaine, 1 seule en vue jour. */
export const TimeGrid: FC<TimeGridProps> = ({
  days,
  events,
  onSlotClick,
  onEventClick,
  onEventDrop,
  onEventResize,
}) => {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const now = new Date();
  const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;

  const handleDrop = (event: DragEvent<HTMLDivElement>, day: Date, hour: number) => {
    event.preventDefault();
    setDragOverKey(null);
    const eventId = Number(event.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(eventId)) onEventDrop(eventId, day, hour);
  };

  return (
    <div className="overflow-x-auto rounded-card bg-surface-2 p-2">
      <div className="min-w-[520px] md:min-w-0">
        <div className="flex">
          <div className="w-12 shrink-0" />
          {days.map((day) => (
            <div
              key={toIsoDate(day)}
              className={[
                'flex-1 pb-2 text-center text-[13px] font-medium capitalize',
                isSameDay(day, now) ? 'text-accent' : 'text-text-muted',
              ].join(' ')}
            >
              {formatDayLabel(day)}
            </div>
          ))}
        </div>

        <div className="flex">
          <div className="relative w-12 shrink-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="pr-2 text-right text-[10px] text-text-faint"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour > 0 ? `${String(hour).padStart(2, '0')}h` : ''}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayIso = toIsoDate(day);
            const dayEvents = events.filter((item) => item.dateDebut.startsWith(dayIso));
            return (
              <div key={dayIso} className="relative flex-1 border-l border-border">
                {HOURS.map((hour) => {
                  const slotKey = `${dayIso}-${hour}`;
                  return (
                    <div
                      key={slotKey}
                      role="button"
                      aria-label={`Créer un événement le ${dayIso} à ${hour}h`}
                      className={[
                        'border-t border-border/60',
                        dragOverKey === slotKey ? 'bg-accent-soft' : 'hover:bg-surface-2',
                      ].join(' ')}
                      style={{ height: HOUR_HEIGHT }}
                      onClick={() => onSlotClick(day, hour)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverKey(slotKey);
                      }}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(event) => handleDrop(event, day, hour)}
                    />
                  );
                })}

                {dayEvents.map((item) => (
                  <EventBlock
                    key={item.id}
                    event={item}
                    hourHeight={HOUR_HEIGHT}
                    onClick={onEventClick}
                    onResize={onEventResize}
                  />
                ))}

                {isSameDay(day, now) && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-danger"
                    style={{ top: nowTop }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
