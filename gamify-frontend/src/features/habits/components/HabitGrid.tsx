import type { FC } from 'react';

interface HabitGridProps {
  completions: string[];
  couleur: string;
  onCancelDay: (iso: string) => void;
}

const GRID_DAYS = 84; // 12 semaines (domain.md)

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * Grille de contributions type GitHub/HabitKit : 12 colonnes-semaines × 7 jours,
 * la dernière cellule (en bas à droite) = aujourd'hui. Double-clic sur un carré
 * coché pour annuler cette complétion ; survol prolongé pour voir la date.
 */
export const HabitGrid: FC<HabitGridProps> = ({ completions, couleur, onCancelDay }) => {
  const done = new Set(completions);
  const today = new Date();

  const cells = Array.from({ length: GRID_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (GRID_DAYS - 1 - index));
    const iso = toIsoDate(date);
    return { iso, isDone: done.has(iso) };
  });

  return (
    <div className="grid w-full grid-flow-col grid-rows-7 gap-[3px]">
      {cells.map((cell) => (
        <div key={cell.iso} className="group relative">
          <div
            role={cell.isDone ? 'button' : undefined}
            aria-label={`${formatDateLabel(cell.iso)}${cell.isDone ? ' — double-clic pour annuler' : ''}`}
            onDoubleClick={cell.isDone ? () => onCancelDay(cell.iso) : undefined}
            className={`aspect-square w-full min-w-1 rounded-[2px] ${cell.isDone ? 'cursor-pointer' : ''}`}
            style={{ backgroundColor: cell.isDone ? couleur : `${couleur}22` }}
          />
          <span
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-small bg-surface-3 px-1.5 py-0.5 text-[10px] text-text opacity-0 shadow-subtle transition-opacity delay-700 duration-150 group-hover:opacity-100"
          >
            {formatDateLabel(cell.iso)}
          </span>
        </div>
      ))}
    </div>
  );
};
