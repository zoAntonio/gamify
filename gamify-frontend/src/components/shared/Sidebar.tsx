import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/activities', label: 'Tâches' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/habits', label: 'Habitudes' },
  { to: '/onboarding', label: 'Profil' },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/admin/domaines', label: 'Domaines' },
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/saisons', label: 'Saisons' },
  { to: '/admin/badges', label: 'Badges' },
];

export const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const username = useAuthStore((state) => state.username);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-control px-3 py-2 text-[15px] font-medium transition-colors',
      isActive ? 'bg-accent-soft text-accent' : 'text-text-muted active:bg-surface-2',
    ].join(' ');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-6 border-r border-border bg-surface-3/90 p-6 backdrop-blur-md',
          'transition-transform md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-medium text-heading">Gamify</p>
            {username && <p className="text-sm text-text-muted">{username}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted md:hidden"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Administration
              </p>
              {ADMIN_NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClasses} onClick={onClose}>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="rounded-control px-3 py-2 text-left text-[15px] font-medium text-danger active:bg-surface-2"
        >
          Se déconnecter
        </button>
      </aside>
    </>
  );
};
