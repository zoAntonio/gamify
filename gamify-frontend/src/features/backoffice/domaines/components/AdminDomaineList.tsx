import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import type { AdminDomaine } from '@/features/backoffice/domaines/types/adminDomaine.types';

interface AdminDomaineListProps {
  domaines: AdminDomaine[];
  onEdit: (domaine: AdminDomaine) => void;
  onDeactivate: (domaine: AdminDomaine) => void;
  deactivatingId: number | null;
}

export const AdminDomaineList: FC<AdminDomaineListProps> = ({
  domaines,
  onEdit,
  onDeactivate,
  deactivatingId,
}) => {
  if (domaines.length === 0) {
    return <p className="text-[15px] text-text-muted">Aucun domaine.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-control bg-surface shadow-glass">
      {domaines.map((domaine) => (
        <li key={domaine.id} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className={['text-[15px] text-text', domaine.actif ? '' : 'opacity-50 line-through'].join(' ')}>
              {domaine.nom} <span className="text-text-muted">({domaine.attributs.join(', ')})</span>
            </p>
            <p className="text-[13px] text-text-muted">
              {domaine.systeme ? 'Système' : `Perso — ${domaine.proprietaire}`}
              {!domaine.actif && ' — désactivé'}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={() => onEdit(domaine)}>
            Modifier
          </Button>
          {domaine.actif && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onDeactivate(domaine)}
              isLoading={deactivatingId === domaine.id}
            >
              Désactiver
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
