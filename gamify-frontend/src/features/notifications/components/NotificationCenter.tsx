import type { FC } from 'react';
import { NotificationToast } from '@/features/notifications/components/NotificationToast';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';

/** Pile de bandeaux in-app, montée une seule fois dans AppLayout. */
export const NotificationCenter: FC = () => {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismiss = useNotificationStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-2 md:inset-x-auto md:right-4 md:w-96">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <NotificationToast toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
};
