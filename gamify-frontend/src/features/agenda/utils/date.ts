const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** LocalDateTime ISO sans fuseau, le format attendu par le backend. */
export const toIsoDateTime = (date: Date): string =>
  `${toIsoDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** Lundi de la semaine du jour donné (convention française). */
export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const shift = (result.getDay() + 6) % 7; // dimanche=0 → 6, lundi=1 → 0
  result.setDate(result.getDate() - shift);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const isSameDay = (a: Date, b: Date): boolean => toIsoDate(a) === toIsoDate(b);

export const formatMonthYear = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);

export const formatDayLabel = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(date);

export const formatTime = (iso: string): string => iso.slice(11, 16);

/** Minutes écoulées depuis minuit pour un LocalDateTime ISO. */
export const minutesOfDay = (iso: string): number =>
  Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16));
