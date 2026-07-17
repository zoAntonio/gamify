import { useState } from 'react';
import type { DragEvent, FC, ReactNode } from 'react';
import type { StatutKanban } from '@/features/activities/types/activity.types';

interface KanbanColumnProps {
  title: string;
  count: number;
  statut: StatutKanban;
  onDropActivity: (activityId: number, statut: StatutKanban) => void;
  children: ReactNode;
}

export const KanbanColumn: FC<KanbanColumnProps> = ({
  title,
  count,
  statut,
  onDropActivity,
  children,
}) => {
  const [isDragOver, setDragOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const activityId = Number(event.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(activityId)) onDropActivity(activityId, statut);
  };

  return (
    <div
      className={[
        // < md : colonne de 85% de large dans le rail à défilement horizontal (snap) ; ≥ md : cellule de grille.
        'w-[85%] shrink-0 snap-center md:w-auto md:shrink',
        'flex min-h-[240px] flex-col gap-3 rounded-card p-3 transition-colors',
        isDragOver ? 'bg-accent-soft' : 'bg-surface-2',
      ].join(' ')}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-baseline gap-2 px-1">
        <h2 className="font-display text-[15px] font-medium tracking-tight text-heading">{title}</h2>
        <span className="text-[13px] text-text-faint">{count}</span>
      </div>

      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};
