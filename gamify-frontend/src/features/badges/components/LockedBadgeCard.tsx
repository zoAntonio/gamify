import type { FC } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PALIER_LABELS } from '@/features/badges/lib/palier';
import type { LockedBadge } from '@/features/badges/types/badge.types';

interface LockedBadgeCardProps {
  badge: LockedBadge;
}

// Badge pas encore débloqué : grisé (AC G2-T15), condition affichée via une barre
// de progression (validations actuelles / seuil) plutôt qu'un simple texte.
export const LockedBadgeCard: FC<LockedBadgeCardProps> = ({ badge }) => {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4 opacity-60 shadow-glass">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase text-text-muted">
          {PALIER_LABELS[badge.palier]}
        </span>
        <span aria-hidden="true" className="text-lg leading-none grayscale">
          🔒
        </span>
      </div>
      <p className="font-display text-[16px] font-medium text-heading">{badge.nom}</p>
      <p className="text-[13px] text-text-muted">{badge.domaineNom}</p>
      {badge.description && <p className="text-[12px] text-text-faint">{badge.description}</p>}
      <ProgressBar
        value={badge.progressionActuelle}
        max={badge.seuilValidations}
        label="Validations"
        className="mt-1"
      />
    </div>
  );
};
