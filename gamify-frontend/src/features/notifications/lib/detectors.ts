import type { AgendaEventSnapshot, BadgeSnapshot } from '@/features/notifications/types/notification.types';

const REMINDER_WINDOW_MS = 30 * 60_000;
export const END_OF_DAY_HOUR = 22;

/**
 * Détecteurs purs (pas d'effet de bord, pas d'appel réseau) utilisés par
 * useNotificationEngine — séparés pour rester testables/lisibles
 * indépendamment de la mécanique de sondage/refs.
 */

/** Événements dont le début tombe dans les 30 prochaines minutes, pas déjà signalés. */
export function detectUpcomingReminders(
  events: AgendaEventSnapshot[],
  now: Date,
  alreadyNotifiedIds: ReadonlySet<number>,
): AgendaEventSnapshot[] {
  return events.filter((event) => {
    if (alreadyNotifiedIds.has(event.id)) return false;
    const startsInMs = new Date(event.dateDebut).getTime() - now.getTime();
    return startsInMs > 0 && startsInMs <= REMINDER_WINDOW_MS;
  });
}

/** Tâches liées à un événement du jour, planifiées, mais pas encore validées. */
export function countUnfinishedTasksToday(events: AgendaEventSnapshot[]): number {
  return events.filter((event) => event.activityId !== null && event.activityStatut !== 'TERMINE').length;
}

/**
 * Badges présents maintenant mais absents de la base connue. `knownIds ===
 * null` signifie "aucun sondage encore fait" : on ne fête rien (ce serait
 * fêter tout l'historique existant au premier chargement de page), on se
 * contente de poser la base.
 */
export function detectNewBadges(
  badges: BadgeSnapshot[],
  knownIds: ReadonlySet<number> | null,
): BadgeSnapshot[] {
  if (knownIds === null) return [];
  return badges.filter((badge) => !knownIds.has(badge.id));
}
