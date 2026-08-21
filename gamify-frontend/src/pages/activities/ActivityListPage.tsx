import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useActivityFilters } from '@/features/activities/hooks/useActivityFilters';
import { activityService } from '@/features/activities/services/activityService';
import { ActivityForm } from '@/features/activities/components/ActivityForm';
import { ActivityCard } from '@/features/activities/components/ActivityCard';
import { ActivityFilters } from '@/features/activities/components/ActivityFilters';
import { ActivityValidationModal } from '@/features/activities/components/ActivityValidationModal';
import { KanbanColumn } from '@/features/activities/components/KanbanColumn';
import type { Activity, ActivityRequest, StatutKanban } from '@/features/activities/types/activity.types';

const COLUMNS: { statut: StatutKanban; title: string }[] = [
  { statut: 'A_FAIRE', title: 'À faire' },
  { statut: 'EN_COURS', title: 'En cours' },
  { statut: 'TERMINE', title: 'Terminé' },
];

export const ActivityListPage: FC = () => {
  const filters = useActivityFilters();
  const { activities, isLoading, error, refetch, changerStatutOptimistic, validerAvecPhoto, supprimerPhoto } =
    useActivities({
      domaineId: filters.domaineId,
      attributCible: filters.attributCible,
      sort: filters.sort || undefined,
    });
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [validatingActivity, setValidatingActivity] = useState<Activity | null>(null);
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
    const error = await changerStatutOptimistic(id, statut);
    if (error) setActionError(error.message);
    setUpdatingId(null);
  };

  // "Valider sans photo" depuis la modale : même chemin que le passage direct en TERMINE.
  const handleValidateWithoutPhoto = async (id: number) => {
    setUpdatingId(id);
    setActionError(null);
    const error = await changerStatutOptimistic(id, 'TERMINE');
    setUpdatingId(null);
    if (error) setActionError(error.message);
    else setValidatingActivity(null);
  };

  const handleDeletePhoto = async (id: number) => {
    setDeletingPhotoId(id);
    setActionError(null);
    const error = await supprimerPhoto(id);
    if (error) setActionError(error.message);
    setDeletingPhotoId(null);
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

      <ActivityFilters
        domaineId={filters.domaineId}
        attributCible={filters.attributCible}
        sort={filters.sort}
        hasActiveFilters={filters.hasActiveFilters}
        onDomaineChange={filters.setDomaineId}
        onAttributChange={filters.setAttributCible}
        onSortChange={filters.setSort}
        onReset={filters.resetFilters}
      />

      {actionError && !isModalOpen && <p className="text-[15px] text-danger">{actionError}</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.statut} className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
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
                    onOpenValidation={setValidatingActivity}
                    onDeletePhoto={handleDeletePhoto}
                    isUpdating={updatingId === activity.id}
                    isDeletingPhoto={deletingPhotoId === activity.id}
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

      <ActivityValidationModal
        activity={validatingActivity}
        onClose={() => setValidatingActivity(null)}
        onValidateWithoutPhoto={handleValidateWithoutPhoto}
        onValidateWithPhoto={validerAvecPhoto}
        isValidatingWithoutPhoto={validatingActivity !== null && updatingId === validatingActivity.id}
      />
    </section>
  );
};
