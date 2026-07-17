import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { activityService } from '@/features/activities/services/activityService';
import { ActivityForm } from '@/features/activities/components/ActivityForm';
import { ActivityCard } from '@/features/activities/components/ActivityCard';
import { KanbanColumn } from '@/features/activities/components/KanbanColumn';
import type { ActivityRequest, StatutKanban } from '@/features/activities/types/activity.types';

const COLUMNS: { statut: StatutKanban; title: string }[] = [
  { statut: 'A_FAIRE', title: 'À faire' },
  { statut: 'EN_COURS', title: 'En cours' },
  { statut: 'TERMINE', title: 'Terminé' },
];

export const ActivityListPage: FC = () => {
  const { activities, isLoading, error, refetch } = useActivities();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async (request: ActivityRequest) => {
    setCreating(true);
    setActionError(null);
    try {
      await activityService.createActivity(request);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  const handleChangeStatut = async (id: number, statut: StatutKanban) => {
    const activity = activities.find((item) => item.id === id);
    if (!activity || activity.statut === statut || activity.statut === 'TERMINE') return;

    setUpdatingId(id);
    setActionError(null);
    try {
      await activityService.changerStatut(id, statut);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Tâches</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Glisse tes tâches entre les colonnes et valide-les pour gagner en attributs.
          </p>
        </div>
        <Button type="button" onClick={() => setModalOpen(true)}>
          + Nouvelle tâche
        </Button>
      </div>

      {actionError && !isModalOpen && <p className="text-[15px] text-danger">{actionError}</p>}
      {isLoading && <p className="text-[15px] text-text-muted">Chargement des tâches...</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnActivities = activities.filter((activity) => activity.statut === column.statut);
            return (
              <KanbanColumn
                key={column.statut}
                title={column.title}
                count={columnActivities.length}
                statut={column.statut}
                onDropActivity={handleChangeStatut}
              >
                {columnActivities.length === 0 && (
                  <p className="px-1 text-[13px] text-text-faint">Aucune tâche</p>
                )}
                {columnActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onChangeStatut={handleChangeStatut}
                    isUpdating={updatingId === activity.id}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} title="Nouvelle tâche" onClose={() => setModalOpen(false)}>
        {actionError && <p className="mb-3 text-[14px] text-danger">{actionError}</p>}
        <ActivityForm onSubmit={handleCreate} isSubmitting={isCreating} />
      </Modal>
    </section>
  );
};
