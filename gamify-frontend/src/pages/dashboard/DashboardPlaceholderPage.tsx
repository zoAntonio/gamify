import type { FC } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Écran minimal en attendant le vrai tableau de bord (G0-T03, hors scope ici).
 */
export const DashboardPlaceholderPage: FC = () => {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);

  return (
    <section className="dashboard-placeholder">
      <h1>Bienvenue {username} !</h1>
      <p>Le tableau de bord complet arrive avec le ticket G0-T03.</p>
      <button type="button" onClick={logout}>
        Se déconnecter
      </button>
    </section>
  );
};
