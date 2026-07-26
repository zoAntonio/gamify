import type { FC } from 'react';
import { HabitGrid } from '@/features/habits/components/HabitGrid';
import type { Habit } from '@/features/habits/types/habit.types';

interface HabitCardProps {
  habit: Habit;
  onCheck: (id: number) => void;
  onCancelDay: (id: number, date: string) => void;
  isChecking: boolean;
}

const FALLBACK_COLOR = '#663af3'; // Void Violet — si l'habitude n'a pas de couleur

export const HabitCard: FC<HabitCardProps> = ({ habit, onCheck, onCancelDay, isChecking }) => {
  const couleur = habit.couleur ?? FALLBACK_COLOR;

  return (
    <div className="flex flex-col gap-2.5 rounded-card bg-surface p-3.5 shadow-glass">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-[16px]"
          style={{ backgroundColor: `${couleur}1f` }}
        >
          {habit.icone ?? '✦'}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-text">{habit.nom}</p>
          <p className="truncate text-[11px] text-text-faint">
            {habit.domaineNom ?? 'Domaine supprimé'} · {habit.attributCible} · 🔥{' '}
            {habit.streakCourant} j (record {habit.meilleurStreak})
          </p>
        </div>

        <button
          type="button"
          aria-label={habit.faitAujourdhui ? 'Déjà fait aujourd’hui' : 'Marquer comme fait'}
          disabled={habit.faitAujourdhui || isChecking}
          onClick={() => onCheck(habit.id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-[16px] font-semibold shadow-subtle transition-colors disabled:cursor-not-allowed"
          style={
            habit.faitAujourdhui
              ? { backgroundColor: couleur, color: '#05060f' }
              : { backgroundColor: `${couleur}1f`, color: couleur }
          }
        >
          ✓
        </button>
      </div>

      <HabitGrid
        completions={habit.completions}
        couleur={couleur}
        onCancelDay={(date) => onCancelDay(habit.id, date)}
      />
    </div>
  );
};
