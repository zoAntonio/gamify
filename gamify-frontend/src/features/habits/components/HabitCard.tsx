import type { FC } from 'react';
import { HabitGrid } from '@/features/habits/components/HabitGrid';
import type { Habit } from '@/features/habits/types/habit.types';

interface HabitCardProps {
  habit: Habit;
  onCheck: (id: number) => void;
  isChecking: boolean;
}

const FALLBACK_COLOR = '#663af3'; // Void Violet — si l'habitude n'a pas de couleur

export const HabitCard: FC<HabitCardProps> = ({ habit, onCheck, isChecking }) => {
  const couleur = habit.couleur ?? FALLBACK_COLOR;

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-glass">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-[20px]"
          style={{ backgroundColor: `${couleur}1f` }}
        >
          {habit.icone ?? '✦'}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-medium text-text">{habit.nom}</p>
          <p className="truncate text-[12px] text-text-faint">
            {habit.domaineNom ?? 'Domaine supprimé'} · {habit.attributCible} · 🔥{' '}
            {habit.streakCourant} j (record {habit.meilleurStreak})
          </p>
        </div>

        <button
          type="button"
          aria-label={habit.faitAujourdhui ? 'Déjà fait aujourd’hui' : 'Marquer comme fait'}
          disabled={habit.faitAujourdhui || isChecking}
          onClick={() => onCheck(habit.id)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-[18px] font-semibold shadow-subtle transition-colors disabled:cursor-not-allowed"
          style={
            habit.faitAujourdhui
              ? { backgroundColor: couleur, color: '#05060f' }
              : { backgroundColor: `${couleur}1f`, color: couleur }
          }
        >
          ✓
        </button>
      </div>

      <HabitGrid completions={habit.completions} couleur={couleur} />
    </div>
  );
};
