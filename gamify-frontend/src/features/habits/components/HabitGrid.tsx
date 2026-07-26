import type { FC } from 'react';

interface HabitGridProps {
  completions: string[];
  couleur: string;
}

const GRID_DAYS = 84; // 12 semaines (domain.md)

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Grille de contributions type GitHub/HabitKit : 12 colonnes-semaines × 7 jours,
 * la dernière cellule (en bas à droite) = aujourd'hui.
 */
export const HabitGrid: FC<HabitGridProps> = ({ completions, couleur }) => {
  const done = new Set(completions);
  const today = new Date();

  const cells = Array.from({ length: GRID_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (GRID_DAYS - 1 - index));
    const iso = toIsoDate(date);
    return { iso, isDone: done.has(iso) };
  });

  return (
    <div className="grid w-full grid-flow-col grid-rows-7 gap-1" aria-hidden="true">
      {cells.map((cell) => (
        <div
          key={cell.iso}
          title={cell.iso}
          className="aspect-square w-full min-w-1.5 rounded-small"
          style={{ backgroundColor: cell.isDone ? couleur : `${couleur}22` }}
        />
      ))}
    </div>
  );
};
