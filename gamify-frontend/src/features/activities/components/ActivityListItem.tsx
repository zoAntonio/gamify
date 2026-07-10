import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import type { Activity } from '@/features/activities/types/activity.types';

interface ActivityListItemProps {
  activity: Activity;
  onValider: (id: number) => void;
  isValidating: boolean;
}

const STATUT_LABELS: Record<Activity['statut'], string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
};

export const ActivityListItem: FC<ActivityListItemProps> = ({ activity, onValider, isValidating }) => {
  const isDone = activity.statut === 'TERMINE';

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1">
        <p className="text-[15px] font-medium text-text">{activity.nom}</p>
        <p className="text-[13px] text-text-muted">
          {activity.domaineNom ?? 'Domaine supprimé'} · {activity.attributCible} · {STATUT_LABELS[activity.statut]}
          {activity.objectif && ` · ${activity.objectif}`}
        </p>
      </div>

      {isDone ? (
        <span className="text-[17px] font-semibold text-accent">✓</span>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => onValider(activity.id)}
          disabled={isValidating}
        >
          Valider
        </Button>
      )}
    </li>
  );
};
