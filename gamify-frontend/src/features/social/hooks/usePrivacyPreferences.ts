import { useCallback, useEffect, useState } from 'react';
import { socialService } from '@/features/social/services/socialService';
import { runOptimistic } from '@/utils/optimistic';
import type { PrivacyPreferences } from '@/features/social/types/social.types';

interface UsePrivacyPreferencesReturn {
  preferences: PrivacyPreferences | null;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (next: PrivacyPreferences) => Promise<Error | null>;
}

// Même patron que useNotificationPreferences : un seul réglage ici
// (profilPublic), mais la mécanique (chargement, update optimiste avec
// rollback) reste identique.
export const usePrivacyPreferences = (): UsePrivacyPreferencesReturn => {
  const [preferences, setPreferences] = useState<PrivacyPreferences | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await socialService.getPrivacyPreferences();
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
    async (next: PrivacyPreferences): Promise<Error | null> => {
      if (!preferences) return null;
      return runOptimistic(preferences, setPreferences, next, async () => {
        const updated = await socialService.updatePrivacyPreferences(next);
        setPreferences(updated);
      });
    },
    [preferences],
  );

  return { preferences, isLoading, error, updatePreferences };
};
