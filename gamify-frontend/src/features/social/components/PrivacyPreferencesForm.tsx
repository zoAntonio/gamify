import { useState } from 'react';
import type { FC } from 'react';
import { usePrivacyPreferences } from '@/features/social/hooks/usePrivacyPreferences';
import { Spinner } from '@/components/ui/Spinner';

export const PrivacyPreferencesForm: FC = () => {
  const { preferences, isLoading, error, updatePreferences } = usePrivacyPreferences();
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggle = async () => {
    if (!preferences) return;
    setSaveError(null);
    const err = await updatePreferences({ profilPublic: !preferences.profilPublic });
    if (err) setSaveError(err.message);
  };

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Spinner size="sm" /> Chargement du réglage...
      </p>
    );
  }

  if (error || !preferences) {
    return <p className="text-sm text-danger">Impossible de charger le réglage de confidentialité.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 rounded-card border border-border bg-surface p-4">
        <div>
          <p className="text-[14px] font-medium text-text">Profil public</p>
          <p className="mt-1 text-[13px] text-text-muted">
            Désactivé par défaut. Une fois activé, ton pseudo, ton niveau, ton XP total, tes
            valeurs d'attributs et tes actions récentes (tâches validées, habitudes cochées)
            deviennent visibles des autres utilisateurs dans le classement et le fil d'activité.
            Ton email et ton mot de passe ne sont jamais exposés.
          </p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={preferences.profilPublic}
            onChange={toggle}
            aria-label="Profil public"
          />
          <span className="h-6 w-11 rounded-full bg-surface-2 shadow-subtle transition-colors peer-checked:bg-accent" />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      <p className="text-[13px] text-text-muted">
        {preferences.profilPublic
          ? '✅ Ton profil est actuellement public.'
          : '🔒 Ton profil est actuellement privé — invisible du classement et du fil d\'activité.'}
      </p>

      {saveError && <p className="text-sm text-danger">{saveError}</p>}
    </div>
  );
};
