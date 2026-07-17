import type { AgendaEvent } from '@/features/agenda/types/agenda.types';

/**
 * Règle G1-T10 : lié à une tâche TERMINE → vert ; lié + créneau passé sans
 * validation → rouge ; sinon (libre ou à venir) → accent violet.
 */
export const eventColorClasses = (event: AgendaEvent): string => {
  if (event.activityStatut === 'TERMINE') {
    return 'border-success bg-success/15 text-success';
  }
  if (event.activityId !== null && new Date(event.dateFin) < new Date()) {
    return 'border-danger bg-danger/15 text-danger';
  }
  return 'border-accent bg-accent-soft text-text';
};
