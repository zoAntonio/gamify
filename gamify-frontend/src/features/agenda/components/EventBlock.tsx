import type { DragEvent, FC } from 'react';
import { eventColorClasses } from '@/features/agenda/utils/eventColor';
import { formatTime, minutesOfDay } from '@/features/agenda/utils/date';
import type { AgendaEvent } from '@/features/agenda/types/agenda.types';

interface EventBlockProps {
  event: AgendaEvent;
  hourHeight: number;
  onClick: (event: AgendaEvent) => void;
}

/** Bloc positionné en absolu dans une colonne-jour de la grille horaire. */
export const EventBlock: FC<EventBlockProps> = ({ event, hourHeight, onClick }) => {
  const startMinutes = minutesOfDay(event.dateDebut);
  const endMinutes = Math.max(minutesOfDay(event.dateFin), startMinutes + 30);

  const handleDragStart = (dragEvent: DragEvent<HTMLButtonElement>) => {
    dragEvent.dataTransfer.setData('text/plain', String(event.id));
    dragEvent.dataTransfer.effectAllowed = 'move';
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(event)}
      className={[
        'absolute inset-x-0.5 z-10 flex cursor-pointer flex-col overflow-hidden rounded-input border-l-2 px-1.5 py-1 text-left shadow-subtle',
        eventColorClasses(event),
      ].join(' ')}
      style={{
        top: (startMinutes / 60) * hourHeight,
        height: ((endMinutes - startMinutes) / 60) * hourHeight,
      }}
    >
      <span className="truncate text-[11px] font-semibold leading-tight">
        {event.serieId !== null && <span aria-label="Événement récurrent">↻ </span>}
        {event.titre}
      </span>
      <span className="truncate text-[10px] opacity-80">
        {formatTime(event.dateDebut)} – {formatTime(event.dateFin)}
      </span>
    </button>
  );
};
