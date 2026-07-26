const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

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

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const isSameDay = (a: Date, b: Date): boolean => toIsoDate(a) === toIsoDate(b);

export const formatMonthYear = (date: Date): string =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
