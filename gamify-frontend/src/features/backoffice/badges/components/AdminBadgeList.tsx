import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import type { BadgeDefinition } from '@/features/backoffice/badges/types/adminBadge.types';

interface AdminBadgeListProps {
  badges: BadgeDefinition[];
  onEdit: (badge: BadgeDefinition) => void;
  onDeactivate: (badge: BadgeDefinition) => void;
  deactivatingId: number | null;
}

export const AdminBadgeList: FC<AdminBadgeListProps> = ({ badges, onEdit, onDeactivate, deactivatingId }) => {
  if (badges.length === 0) {
    return <p className="text-[15px] text-text-muted">Aucun badge.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-control bg-surface shadow-glass">
      {badges.map((badge) => (
        <li key={badge.id} className="flex items-center gap-3 px-4 py-3">
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase text-text-muted">
            {badge.palier}
          </span>
          <div className="flex-1">
            <p className={['text-[15px] text-text', badge.actif ? '' : 'opacity-50 line-through'].join(' ')}>
              {badge.nom} <span className="text-text-muted">— {badge.domaineNom}</span>
            </p>
            <p className="text-[13px] text-text-muted">
              {badge.seuilValidations} validations{!badge.actif && ' — désactivé'}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={() => onEdit(badge)}>
            Modifier
          </Button>
          {badge.actif && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onDeactivate(badge)}
              isLoading={deactivatingId === badge.id}
            >
              Désactiver
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
