import { useCallback, useEffect, useState } from 'react';
import { agendaService } from '@/features/agenda/services/agendaService';
import type { AgendaEvent } from '@/features/agenda/types/agenda.types';

interface UseAgendaEventsReturn {
  events: AgendaEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAgendaEvents = (from: string, to: string): UseAgendaEventsReturn => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await agendaService.listEvents(from, to);
        if (!cancelled) setEvents(data.content);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [from, to, refetchToken]);

  return { events, isLoading, error, refetch };
};
