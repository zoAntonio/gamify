import { useState } from 'react';
import type { DragEvent, PointerEvent as ReactPointerEvent, FC } from 'react';
import { eventColorClasses } from '@/features/agenda/utils/eventColor';
import { formatTime, minutesOfDay, minutesToTime } from '@/features/agenda/utils/date';
import type { AgendaEvent } from '@/features/agenda/types/agenda.types';

interface EventBlockProps {
  event: AgendaEvent;
  hourHeight: number;
  onClick: (event: AgendaEvent) => void;
  /** newDateFin est un LocalDateTime ISO complet (même jour, nouvelle heure). */
  onResize: (event: AgendaEvent, newDateFin: string) => void;
}

// Granularité du redimensionnement : plus fine que le déplacement (1h), pour un
// geste de glisser continu — voir AC "1h, ou plus fin si voulu".
const RESIZE_STEP_MINUTES = 15;
const MIN_DURATION_MINUTES = 30;
const END_OF_DAY_MINUTES = 23 * 60 + 59; // pas de support multi-jour (même limite que le reste de l'agenda)

const snapToStep = (minutes: number): number =>
  Math.round(minutes / RESIZE_STEP_MINUTES) * RESIZE_STEP_MINUTES;

/** Bloc positionné en absolu dans une colonne-jour de la grille horaire. */
export const EventBlock: FC<EventBlockProps> = ({ event, hourHeight, onClick, onResize }) => {
  const [previewEndMinutes, setPreviewEndMinutes] = useState<number | null>(null);

  const startMinutes = minutesOfDay(event.dateDebut);
  const endMinutes = Math.max(minutesOfDay(event.dateFin), startMinutes + 30);
  const displayEndMinutes = previewEndMinutes ?? endMinutes;

  const handleDragStart = (dragEvent: DragEvent<HTMLButtonElement>) => {
    dragEvent.dataTransfer.setData('text/plain', String(event.id));
    dragEvent.dataTransfer.effectAllowed = 'move';
  };

  const handleResizePointerDown = (pointerDownEvent: ReactPointerEvent<HTMLDivElement>) => {
    pointerDownEvent.preventDefault();
    pointerDownEvent.stopPropagation();
    const startY = pointerDownEvent.clientY;
    let latestMinutes = endMinutes;

    const clamp = (minutes: number): number =>
      Math.min(END_OF_DAY_MINUTES, Math.max(startMinutes + MIN_DURATION_MINUTES, minutes));

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const deltaMinutes = ((moveEvent.clientY - startY) / hourHeight) * 60;
      latestMinutes = clamp(snapToStep(endMinutes + deltaMinutes));
      setPreviewEndMinutes(latestMinutes);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setPreviewEndMinutes(null);
      if (latestMinutes !== endMinutes) {
        onResize(event, `${event.dateFin.slice(0, 10)}T${minutesToTime(latestMinutes)}`);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(event)}
      className={[
        'group absolute inset-x-0.5 z-10 flex cursor-pointer flex-col overflow-hidden rounded-input border-l-2 px-1.5 py-1 text-left shadow-subtle',
        eventColorClasses(event),
      ].join(' ')}
      style={{
        top: (startMinutes / 60) * hourHeight,
        height: ((displayEndMinutes - startMinutes) / 60) * hourHeight,
      }}
    >
      <span className="truncate text-[11px] font-semibold leading-tight">
        {event.serieId !== null && <span aria-label="Événement récurrent">↻ </span>}
        {event.titre}
      </span>
      <span className="truncate text-[10px] opacity-80">
        {formatTime(event.dateDebut)} – {minutesToTime(displayEndMinutes).slice(0, 5)}
      </span>

      {/* Poignée de redimensionnement : visible au survol, tire le bord bas pour
          étirer/raccourcir. draggable=false pour ne pas déclencher le drag & drop
          natif (déplacement) porté par le bouton parent. */}
      <div
        role="presentation"
        draggable={false}
        onPointerDown={handleResizePointerDown}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        className="absolute inset-x-0 bottom-0 flex h-2 cursor-ns-resize items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <div className="h-0.5 w-6 rounded-full bg-white/70" />
      </div>
    </button>
  );
};
