import { useState } from 'react';
import type { FC } from 'react';
import { List } from '@/components/ui/List';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { activityService } from '@/features/activities/services/activityService';
import { ActivityForm } from '@/features/activities/components/ActivityForm';
import { ActivityListItem } from '@/features/activities/components/ActivityListItem';
import type { ActivityRequest } from '@/features/activities/types/activity.types';

export const ActivityListPage: FC = () => {
  const { activities, isLoading, error, refetch } = useActivities();
  const [isCreating, setCreating] = useState(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async (request: ActivityRequest) => {
    setCreating(true);
    setActionError(null);
    try {
      await activityService.createActivity(request);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  const handleValider = async (id: number) => {
    setValidatingId(id);
    setActionError(null);
    try {
      await activityService.validerActivity(id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <section className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">Tâches</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Crée des tâches liées à tes domaines et valide-les pour gagner en attributs.
        </p>
      </div>

      <ActivityForm onSubmit={handleCreate} isSubmitting={isCreating} />

      {actionError && <p className="text-[15px] text-danger">{actionError}</p>}

      {isLoading && <p className="text-[15px] text-text-muted">Chargement des tâches...</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {!isLoading && !error && activities.length === 0 && (
        <p className="text-[15px] text-text-muted">Aucune tâche pour l'instant.</p>
      )}

      {!isLoading && !error && activities.length > 0 && (
        <List>
          {activities.map((activity) => (
            <ActivityListItem
              key={activity.id}
              activity={activity}
              onValider={handleValider}
              isValidating={validatingId === activity.id}
            />
          ))}
        </List>
      )}
    </section>
  );
};
