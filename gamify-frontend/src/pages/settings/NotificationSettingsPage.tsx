import type { FC } from 'react';
import { NotificationPreferencesForm } from '@/features/notifications/components/NotificationPreferencesForm';

export const NotificationSettingsPage: FC = () => {
  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Notifications</h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Choisis les catégories de notification à recevoir. Chacune peut être activée ou
          désactivée indépendamment.
        </p>
      </div>

      <NotificationPreferencesForm />
    </section>
  );
};
