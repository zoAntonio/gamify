import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { habitService } from '@/features/habits/services/habitService';
import { HabitCard } from '@/features/habits/components/HabitCard';
import { HabitForm } from '@/features/habits/components/HabitForm';
import type { HabitRequest } from '@/features/habits/types/habit.types';

export const HabitsPage: FC = () => {
  const { habits, isLoading, error, refetch, toggleHabit } = useHabits();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async (request: HabitRequest) => {
    setCreating(true);
    setActionError(null);
    try {
      await habitService.createHabit(request);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  const handleCheck = async (id: number) => {
    setCheckingId(id);
    setActionError(null);
    const error = await toggleHabit(id);
    if (error) setActionError(error.message);
    setCheckingId(null);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">
            Habitudes
          </h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Coche tes habitudes chaque jour — 7 jours de série = +10 XP bonus.
          </p>
        </div>
        <Button type="button" onClick={() => setModalOpen(true)}>
          + Nouvelle habitude
        </Button>
      </div>

      {actionError && !isModalOpen && <p className="text-[15px] text-danger">{actionError}</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[124px] w-full" />
          ))}
        </div>
      )}

      {!isLoading && !error && habits.length === 0 && (
        <p className="text-[15px] text-text-muted">
          Aucune habitude pour l'instant — crée la première.
        </p>
      )}

      {!isLoading && !error && habits.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onCheck={handleCheck}
              isChecking={checkingId === habit.id}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} title="Nouvelle habitude" onClose={() => setModalOpen(false)}>
        {actionError && <p className="mb-3 text-[14px] text-danger">{actionError}</p>}
        <HabitForm onSubmit={handleCreate} isSubmitting={isCreating} />
      </Modal>
    </section>
  );
};
