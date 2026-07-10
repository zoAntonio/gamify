import { useState } from 'react';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Sidebar';

export const AppLayout: FC = () => {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-bg text-text">
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <span className="text-lg font-semibold">Gamify</span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-control border border-border p-2 text-text-muted"
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
