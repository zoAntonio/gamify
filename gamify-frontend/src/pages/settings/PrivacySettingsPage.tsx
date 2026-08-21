import type { FC } from 'react';
import { PrivacyPreferencesForm } from '@/features/social/components/PrivacyPreferencesForm';

export const PrivacySettingsPage: FC = () => {
  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Confidentialité</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Choisis si ton profil apparaît dans le classement et le fil d'activité des autres
          joueurs. Désactivé par défaut : rien n'est partagé tant que tu ne l'actives pas.
        </p>
      </div>

      <PrivacyPreferencesForm />
    </section>
  );
};
