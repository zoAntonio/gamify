// Dupliqué (minimal) depuis features/agenda/utils/date.ts — indépendance des
// features (frontend-workflow.md), seul toIsoDateTime est nécessaire ici.
const pad = (value: number): string => String(value).padStart(2, '0');

/** LocalDateTime ISO sans fuseau, le format attendu par le backend. */
export const toIsoDateTime = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

export const startOfToday = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfToday = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 0);
  return result;
};

/** yyyy-MM-dd — sert de clé de déduplication "une alerte fin de journée par jour". */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
