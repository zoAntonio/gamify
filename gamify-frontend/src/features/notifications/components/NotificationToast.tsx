import { useEffect } from 'react';
import type { FC } from 'react';
import type { ToastItem, ToastVariant } from '@/features/notifications/types/notification.types';

interface NotificationToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const AUTO_DISMISS_MS = 6000;

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  rappel: 'border-accent bg-accent-soft text-text',
  finJournee: 'border-danger bg-danger/15 text-text',
  celebration: 'border-success bg-success/15 text-text',
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  rappel: '⏰',
  finJournee: '🌙',
  celebration: '🎉',
};

export const NotificationToast: FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={[
        'flex items-start gap-3 rounded-card border px-4 py-3 shadow-modal backdrop-blur-md',
        VARIANT_CLASSES[toast.variant],
      ].join(' ')}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {VARIANT_ICONS[toast.variant]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-heading">{toast.title}</p>
        <p className="text-[13px] text-text-muted">{toast.message}</p>
      </div>
      <button
        type="button"
        aria-label="Fermer la notification"
        onClick={() => onDismiss(toast.id)}
        className="text-text-faint transition-colors hover:text-text"
      >
        ✕
      </button>
    </div>
  );
};
