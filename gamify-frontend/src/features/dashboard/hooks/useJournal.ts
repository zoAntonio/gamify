import { useEffect, useState } from 'react';
import { statsService } from '@/features/dashboard/services/statsService';
import type { JournalEntry } from '@/features/dashboard/types/stats.types';

interface UseJournalReturn {
  entries: JournalEntry[];
  isLoading: boolean;
  error: Error | null;
}

export const useJournal = (): UseJournalReturn => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    statsService
      .getJournal()
      .then((data) => {
        if (!cancelled) setEntries(data.content);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, isLoading, error };
};
