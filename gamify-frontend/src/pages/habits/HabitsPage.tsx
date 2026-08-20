import { useState } from 'react';
import type { FC } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { habitService } from '@/features/habits/services/habitService';
import { HabitCard } from '@/features/habits/components/HabitCard';
import { HabitDetailModal } from '@/features/habits/components/HabitDetailModal';
import { HabitForm } from '@/features/habits/components/HabitForm';
import { Button } from '@/components/ui/Button';
import type { Habit, HabitRequest } from '@/features/habits/types/habit.types';

interface FormModalState {
  habit?: Habit;
}

export const HabitsPage: FC = () => {
  const { habits, isLoading, error, refetch, toggleHabit, cancelDay, checkDay } = useHabits();
  const [formModal, setFormModal] = useState<FormModalState | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<number | null>(null);
  const detailHabit = habits.find((habit) => habit.id === detailHabitId) ?? null;

  const runAction = async (action: () => Promise<unknown>, closeModal: boolean) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await action();
      if (closeModal) setFormModal(null);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (request: HabitRequest) => {
    const editing = formModal?.habit;
    runAction(
      () => (editing ? habitService.updateHabit(editing.id, request) : habitService.createHabit(request)),
      true,
    );
  };

  const handleDelete = () => {
    const editing = formModal?.habit;
    if (!editing) return;
    if (!window.confirm(`Supprimer l'habitude « ${editing.nom} » ? L'historique déjà acquis est conservé.`)) return;
    runAction(() => habitService.deleteHabit(editing.id), true);
  };

  const handleCheck = async (id: number) => {
    setCheckingId(id);
    setActionError(null);
    const error = await toggleHabit(id);
    if (error) setActionError(error.message);
    setCheckingId(null);
  };

  const handleCancelDay = async (id: number, date: string) => {
    setActionError(null);
    const error = await cancelDay(id, date);
    if (error) setActionError(error.message);
  };

  const handleToggleDate = async (id: number, date: string) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;
    setActionError(null);
    const error = habit.completions.includes(date) ? await cancelDay(id, date) : await checkDay(id, date);
    if (error) setActionError(error.message);
  };

  const openEdit = (habit: Habit) => {
    setDetailHabitId(null);
    setActionError(null);
    setFormModal({ habit });
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
        <Button type="button" onClick={() => setFormModal({})}>
          + Nouvelle habitude
        </Button>
      </div>

      {actionError && !formModal && <p className="text-[15px] text-danger">{actionError}</p>}
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
              onCancelDay={handleCancelDay}
              onOpenDetail={setDetailHabitId}
              isChecking={checkingId === habit.id}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={formModal !== null}
        title={formModal?.habit ? 'Modifier l’habitude' : 'Nouvelle habitude'}
        onClose={() => setFormModal(null)}
      >
        {actionError && <p className="mb-3 text-[14px] text-danger">{actionError}</p>}
        {formModal && (
          <HabitForm
            initialValues={formModal.habit}
            onSubmit={handleSubmit}
            onDelete={formModal.habit ? handleDelete : undefined}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {detailHabit && (
        <HabitDetailModal
          habit={detailHabit}
          isOpen
          onClose={() => setDetailHabitId(null)}
          onToggleDate={handleToggleDate}
          onEdit={openEdit}
        />
      )}
    </section>
  );
};
