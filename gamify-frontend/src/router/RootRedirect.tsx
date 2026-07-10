import type { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfile } from '@/features/profile/hooks/useProfile';

/**
 * Décide où rediriger depuis "/" : /login si non connecté, /onboarding si le
 * profil n'a pas encore d'avatar choisi, /dashboard sinon.
 */
export const RootRedirect: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { profile, isLoading } = useProfile(isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <p>Chargement...</p>;
  }

  if (!profile?.avatar) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};
