import { useState } from 'react';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { useNotificationEngine } from '@/features/notifications/hooks/useNotificationEngine';

export const AppLayout: FC = () => {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  // AppLayout n'est monté que sous ProtectedRoute (voir AppRouter) : un
  // utilisateur authentifié est toujours présent ici, le moteur peut donc
  // tourner sans condition supplémentaire.
  useNotificationEngine(true);

  return (
    <div className="flex min-h-svh text-text">
      <NotificationCenter />
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface-3/80 px-4 py-3 backdrop-blur-md md:hidden">
          <span className="font-display text-[17px] font-medium text-heading">Gamify</span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-control p-2 text-text-muted active:bg-surface-2"
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
