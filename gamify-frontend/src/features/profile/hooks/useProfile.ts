import { useCallback, useEffect, useState } from 'react';
import { profileService } from '@/features/profile/services/profileService';
import type { ProfileResponse } from '@/features/profile/types/profile.types';

interface UseProfileReturn {
  profile: ProfileResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useProfile = (enabled: boolean = true): UseProfileReturn => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await profileService.getProfile();
        if (!cancelled) setProfile(data);
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
  }, [enabled, refetchToken]);

  return { profile, isLoading, error, refetch };
};
