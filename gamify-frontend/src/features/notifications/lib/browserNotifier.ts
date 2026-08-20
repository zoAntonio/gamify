import { logger } from '@/lib/logger';

/**
 * Fine couche autour de l'API Notification du navigateur (mécanisme retenu
 * pour G1-T12 — voir NotificationPreferencesService côté backend pour le
 * détail du choix, pas de Web Push). Toujours utilisée en complément d'un
 * bandeau in-app, jamais seule : la permission peut être refusée, l'API peut
 * être absente (vieux navigateur, webview Capacitor future), et même
 * accordée, un navigateur peut choisir de ne rien afficher si l'onglet est
 * au premier plan.
 */

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/** Doit être appelé depuis un geste utilisateur (clic) — exigence des navigateurs. */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (error) {
    logger.warn('notifications', 'Échec de la demande de permission Notification', { error });
    return Notification.permission;
  }
}

export function showBrowserNotification(title: string, body: string): void {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body });
  } catch (error) {
    logger.warn('notifications', 'Échec d\'affichage de la notification navigateur', { error });
  }
}
