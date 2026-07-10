import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Écran minimal en attendant le vrai tableau de bord (G0-T03, hors scope ici).
 */
export const DashboardPlaceholderPage: FC = () => {
  const username = useAuthStore((state) => state.username);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">Bienvenue {username} !</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Le tableau de bord complet arrive avec le ticket G0-T03.
        </p>
      </div>

      <div className="rounded-card bg-surface p-6">
        <p className="text-[15px] text-text-muted">
          En attendant, tu peux compléter ton profil (avatar, domaines suivis) depuis{' '}
          <Link to="/onboarding" className="font-medium text-accent hover:text-accent-hover">
            la page Profil
          </Link>
          .
        </p>
      </div>
    </section>
  );
};
