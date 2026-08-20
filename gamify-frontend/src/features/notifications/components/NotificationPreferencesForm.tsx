import { useState } from 'react';
import type { FC } from 'react';
import { useNotificationPreferences } from '@/features/notifications/hooks/useNotificationPreferences';
import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
} from '@/features/notifications/lib/browserNotifier';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { NotificationPreferences } from '@/features/notifications/types/notification.types';

interface PreferenceRow {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

const ROWS: PreferenceRow[] = [
  {
    key: 'rappelActif',
    label: 'Rappel avant une échéance',
    description: "~30 minutes avant le début d'une tâche ou d'un événement planifié dans l'agenda.",
  },
  {
    key: 'finJourneeActif',
    label: 'Alerte fin de journée',
    description: "Vers 22h, si des tâches planifiées aujourd'hui n'ont pas été validées.",
  },
  {
    key: 'celebrationActif',
    label: 'Célébration',
    description: 'À chaque montée de niveau et à chaque badge débloqué.',
  },
];

function permissionLabel(permission: NotificationPermission | 'unsupported'): string {
  switch (permission) {
    case 'granted':
      return 'Activées — tu recevras aussi une notification système.';
    case 'denied':
      return "Refusées dans le navigateur — les bandeaux dans l'app restent actifs.";
    case 'unsupported':
      return "Non disponibles sur ce navigateur — les bandeaux dans l'app restent actifs.";
    default:
      return "Pas encore activées — les bandeaux dans l'app fonctionnent déjà sans ça.";
  }
}

export const NotificationPreferencesForm: FC = () => {
  const { preferences, isLoading, error, updatePreferences } = useNotificationPreferences();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [permission, setPermission] = useState(getBrowserNotificationPermission());

  const toggle = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    setSaveError(null);
    const err = await updatePreferences({ ...preferences, [key]: !preferences[key] });
    if (err) setSaveError(err.message);
  };

  const handleRequestPermission = async () => {
    setPermission(await requestBrowserNotificationPermission());
  };

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Spinner size="sm" /> Chargement des préférences...
      </p>
    );
  }

  if (error || !preferences) {
    return <p className="text-sm text-danger">Impossible de charger les préférences de notification.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
        <div>
          <p className="text-[14px] font-medium text-text">Notifications navigateur</p>
          <p className="text-[13px] text-text-muted">{permissionLabel(permission)}</p>
        </div>
        {isBrowserNotificationSupported() && permission === 'default' && (
          <Button type="button" variant="secondary" onClick={handleRequestPermission}>
            Activer
          </Button>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {ROWS.map((row) => (
          <li
            key={row.key}
            className="flex items-start justify-between gap-4 rounded-card border border-border bg-surface p-4"
          >
            <div>
              <p className="text-[14px] font-medium text-text">{row.label}</p>
              <p className="text-[13px] text-text-muted">{row.description}</p>
            </div>
            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={preferences[row.key]}
                onChange={() => toggle(row.key)}
                aria-label={row.label}
              />
              <span className="h-6 w-11 rounded-full bg-surface-2 shadow-subtle transition-colors peer-checked:bg-accent" />
              <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </label>
          </li>
        ))}
      </ul>

      {saveError && <p className="text-sm text-danger">{saveError}</p>}
    </div>
  );
};
