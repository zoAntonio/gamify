import { useEffect, useState } from 'react';
import { agendaService } from '@/features/agenda/services/agendaService';
import type { ActivityOption } from '@/features/agenda/types/agenda.types';

interface UseActivityOptionsReturn {
  activities: ActivityOption[];
  isLoading: boolean;
}

/** Options du select "Lier à une tâche" du formulaire d'événement. */
export const useActivityOptions = (): UseActivityOptionsReturn => {
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    agendaService
      .listActivityOptions()
      .then((data) => {
        if (!cancelled) setActivities(data.content);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { activities, isLoading };
};
