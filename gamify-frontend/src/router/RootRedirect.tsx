import type { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Décide où rediriger depuis "/" : /login si non connecté, /dashboard sinon.
 * On ne force plus /onboarding automatiquement même si le profil est
 * incomplet — l'utilisateur y accède librement via la sidebar quand il le
 * souhaite (décision produit : d'abord des pages consultables simplement).
 */
export const RootRedirect: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};
