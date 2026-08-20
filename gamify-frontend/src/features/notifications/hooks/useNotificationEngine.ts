import { useEffect, useRef } from 'react';
import { notificationPreferencesService } from '@/features/notifications/services/notificationPreferencesService';
import { notificationScanService } from '@/features/notifications/services/notificationScanService';
import { showBrowserNotification } from '@/features/notifications/lib/browserNotifier';
import {
  countUnfinishedTasksToday,
  detectNewBadges,
  detectUpcomingReminders,
  END_OF_DAY_HOUR,
} from '@/features/notifications/lib/detectors';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { endOfToday, startOfToday, toIsoDate, toIsoDateTime } from '@/features/notifications/utils/date';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';

const POLL_INTERVAL_MS = 60_000;

/**
 * Moteur de détection des 3 catégories de notification (G1-T12), monté une
 * seule fois dans AppLayout tant qu'un utilisateur est authentifié. Aucun
 * job planifié côté backend : ce hook sonde toutes les 60s des endpoints déjà
 * existants (/api/profile, /api/badges/me, /api/agenda) et pousse un toast
 * (+ notification navigateur si permission accordée, voir browserNotifier)
 * quand une condition est détectée — voir NotificationPreferencesService
 * côté backend pour le détail du choix d'architecture (pas de Web Push).
 *
 * Précision acceptée : le sondage à 60s introduit jusqu'à ~1 min d'écart sur
 * le rappel "30 min avant" et sur la détection de montée de niveau/badge —
 * jugé largement suffisant pour ces catégories, à revoir si un jour un besoin
 * de notification instantanée apparaît (il faudrait alors la déclencher
 * directement depuis les hooks de mutation concernés plutôt que par sondage).
 */
export const useNotificationEngine = (enabled: boolean): void => {
  const push = useNotificationStore((state) => state.push);
  const username = useAuthStore((state) => state.username);

  const lastKnownNiveau = useRef<number | null>(null);
  const knownBadgeIds = useRef<Set<number> | null>(null);
  const notifiedReminderIds = useRef<Set<number>>(new Set());
  const eodStorageKey = username ? `gamify-notif-eod-${username}` : null;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = async () => {
      try {
        const preferences = await notificationPreferencesService.getPreferences();
        const now = new Date();

        const [profile, badges, events] = await Promise.all([
          notificationScanService.getProfileSnapshot(),
          notificationScanService.getBadgeSnapshots(),
          notificationScanService.getTodayAgendaEvents(
            toIsoDateTime(startOfToday(now)),
            toIsoDateTime(endOfToday(now)),
          ),
        ]);
        if (cancelled) return;

        // Célébration : niveau + badges.
        if (preferences.celebrationActif && profile.niveau > (lastKnownNiveau.current ?? profile.niveau)) {
          push({
            variant: 'celebration',
            title: 'Niveau supérieur !',
            message: `Niveau ${profile.niveau} atteint — ${profile.titre}`,
          });
          showBrowserNotification('Niveau supérieur !', `Niveau ${profile.niveau} atteint — ${profile.titre}`);
        }
        lastKnownNiveau.current = profile.niveau;

        if (preferences.celebrationActif) {
          for (const badge of detectNewBadges(badges, knownBadgeIds.current)) {
            push({
              variant: 'celebration',
              title: 'Badge débloqué !',
              message: `${badge.badgeNom} (${badge.palier})`,
            });
            showBrowserNotification('Badge débloqué !', `${badge.badgeNom} (${badge.palier})`);
          }
        }
        knownBadgeIds.current = new Set(badges.map((badge) => badge.id));

        // Rappel ~30 min avant un événement planifié.
        if (preferences.rappelActif) {
          for (const event of detectUpcomingReminders(events, now, notifiedReminderIds.current)) {
            notifiedReminderIds.current.add(event.id);
            push({
              variant: 'rappel',
              title: 'Dans 30 minutes',
              message: event.titre,
            });
            showBrowserNotification('Dans 30 minutes', event.titre);
          }
        }

        // Alerte fin de journée (~22h), une fois par jour par utilisateur.
        if (preferences.finJourneeActif && eodStorageKey && now.getHours() >= END_OF_DAY_HOUR) {
          const today = toIsoDate(now);
          if (window.localStorage.getItem(eodStorageKey) !== today) {
            const restantes = countUnfinishedTasksToday(events);
            if (restantes > 0) {
              const message =
                restantes === 1
                  ? '1 tâche du jour reste non validée'
                  : `${restantes} tâches du jour restent non validées`;
              push({ variant: 'finJournee', title: 'Fin de journée', message });
              showBrowserNotification('Fin de journée', message);
              window.localStorage.setItem(eodStorageKey, today);
            }
          }
        }
      } catch (error) {
        logger.warn('notifications', 'Échec du sondage du moteur de notification', { error });
      }
    };

    tick();
    const interval = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled, push, eodStorageKey]);
};
