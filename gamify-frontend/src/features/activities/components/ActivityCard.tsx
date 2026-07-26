import type { DragEvent, FC } from 'react';
import { Button } from '@/components/ui/Button';
import type { Attribut } from '@/types/attribut.types';
import type { Activity, StatutKanban } from '@/features/activities/types/activity.types';

interface ActivityCardProps {
  activity: Activity;
  onChangeStatut: (id: number, statut: StatutKanban) => void;
  isUpdating: boolean;
}

const FREQUENCE_LABELS: Record<Activity['frequence'], string> = {
  QUOTIDIEN: 'Quotidien',
  HEBDOMADAIRE: 'Hebdo',
  MENSUEL: 'Mensuel',
};

const ATTRIBUT_COLORS: Record<Attribut, string> = {
  INT: 'var(--color-int)',
  FOR: 'var(--color-for)',
  VIT: 'var(--color-vit)',
  PRE: 'var(--color-pre)',
  CHA: 'var(--color-cha)',
  RES: 'var(--color-res)',
};

export const ActivityCard: FC<ActivityCardProps> = ({ activity, onChangeStatut, isUpdating }) => {
  const isDone = activity.statut === 'TERMINE';

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', String(activity.id));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={!isDone && !isUpdating}
      onDragStart={handleDragStart}
      className={[
        'flex flex-col gap-2 rounded-card border-l-2 bg-surface p-3 shadow-glass',
        isDone ? 'opacity-60' : 'cursor-grab active:cursor-grabbing',
      ].join(' ')}
      style={{ borderLeftColor: ATTRIBUT_COLORS[activity.attributCible] }}
    >
      <p className="text-[14px] font-medium leading-snug text-text">{activity.nom}</p>

      <p className="text-[12px] text-text-faint">
        {activity.domaineNom ?? 'Domaine supprimé'}
        {activity.objectif && ` · ${activity.objectif}`}
      </p>

      <div className="flex items-center gap-1.5">
        <span
          className="rounded-input px-1.5 py-0.5 text-[11px] font-semibold"
          style={{ color: ATTRIBUT_COLORS[activity.attributCible] }}
        >
          {activity.attributCible}
        </span>
        <span className="rounded-input bg-surface-2 px-1.5 py-0.5 text-[11px] text-text-muted">
          {FREQUENCE_LABELS[activity.frequence]}
        </span>
        <span className="ml-auto text-[11px] font-medium text-text-faint">+{activity.xpRecompense} XP</span>
      </div>

      {activity.statut === 'A_FAIRE' && (
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1.5 text-[12px]"
          isLoading={isUpdating}
          onClick={() => onChangeStatut(activity.id, 'EN_COURS')}
        >
          Commencer
        </Button>
      )}

      {activity.statut === 'EN_COURS' && (
        <Button
          type="button"
          className="!px-3 !py-1.5 text-[12px]"
          isLoading={isUpdating}
          onClick={() => onChangeStatut(activity.id, 'TERMINE')}
        >
          Valider
        </Button>
      )}

      {isDone && <span className="text-[12px] font-medium text-success">✓ Validée</span>}
    </div>
  );
};
