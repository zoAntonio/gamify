import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import type { Saison } from '@/features/backoffice/saisons/types/adminSaison.types';

interface AdminSaisonListProps {
  saisons: Saison[];
  onCloturer: (saison: Saison) => void;
  cloturingId: number | null;
}

export const AdminSaisonList: FC<AdminSaisonListProps> = ({ saisons, onCloturer, cloturingId }) => {
  if (saisons.length === 0) {
    return <p className="text-[15px] text-text-muted">Aucune saison.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-control bg-surface shadow-glass">
      {saisons.map((saison) => (
        <li key={saison.id} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-[15px] text-text">{saison.nom}</p>
            <p className="text-[13px] text-text-muted">
              {saison.dateDebut} → {saison.dateFin}
              {saison.cloturee ? ' — clôturée' : ' — active'}
            </p>
          </div>
          {!saison.cloturee && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onCloturer(saison)}
              isLoading={cloturingId === saison.id}
            >
              Clôturer
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
