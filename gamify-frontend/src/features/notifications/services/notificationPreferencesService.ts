import { apiClient } from '@/lib/apiClient';
import type { NotificationPreferences } from '@/features/notifications/types/notification.types';

export const notificationPreferencesService = {
  getPreferences: (): Promise<NotificationPreferences> =>
    apiClient.get<NotificationPreferences>('/notification-preferences'),

  updatePreferences: (preferences: NotificationPreferences): Promise<NotificationPreferences> =>
    apiClient.put<NotificationPreferences>('/notification-preferences', preferences),
};
