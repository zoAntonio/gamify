import { create } from 'zustand';
import type { ToastItem } from '@/features/notifications/types/notification.types';

interface NotificationStoreState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

// État global fréquemment modifié (bandeaux affichés/masqués en direct par le
// moteur de détection) — pas persisté : un rechargement de page n'a pas à
// faire réapparaître d'anciens bandeaux (voir tableau state management,
// frontend-react-typescript.md section 6).
export const useNotificationStore = create<NotificationStoreState>()((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
