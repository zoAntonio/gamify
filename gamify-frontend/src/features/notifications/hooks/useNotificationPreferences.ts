import { useCallback, useEffect, useState } from 'react';
import { notificationPreferencesService } from '@/features/notifications/services/notificationPreferencesService';
import { runOptimistic } from '@/utils/optimistic';
import type { NotificationPreferences } from '@/features/notifications/types/notification.types';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (next: NotificationPreferences) => Promise<Error | null>;
}

export const useNotificationPreferences = (): UseNotificationPreferencesReturn => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await notificationPreferencesService.getPreferences();
        if (!cancelled) setPreferences(data);
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
  }, []);

  const updatePreferences = useCallback(
    async (next: NotificationPreferences): Promise<Error | null> => {
      if (!preferences) return null;
      return runOptimistic(preferences, setPreferences, next, async () => {
        const updated = await notificationPreferencesService.updatePreferences(next);
        setPreferences(updated);
      });
    },
    [preferences],
  );

  return { preferences, isLoading, error, updatePreferences };
};
