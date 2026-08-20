import type { FC } from 'react';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { toIsoDate } from '@/features/agenda/utils/date';
import type {
  FrequenceRecurrence,
  JourSemaine,
  RecurrenceRule,
} from '@/features/agenda/types/agenda.types';

interface RecurrenceFieldsProps {
  value: RecurrenceRule;
  onChange: (rule: RecurrenceRule) => void;
  /** yyyy-MM-dd — borne "Se termine le" (min = ce jour, max = +366 jours). */
  startDate: string;
}

const MAX_HORIZON_DAYS = 366;

const FREQUENCE_LABELS: { value: FrequenceRecurrence; label: string }[] = [
  { value: 'QUOTIDIEN', label: 'Tous les jours' },
  { value: 'HEBDOMADAIRE', label: 'Toutes les semaines' },
  { value: 'MENSUEL', label: 'Tous les mois' },
];

const WEEKDAYS: { value: JourSemaine; label: string }[] = [
  { value: 'MONDAY', label: 'Lun' },
  { value: 'TUESDAY', label: 'Mar' },
  { value: 'WEDNESDAY', label: 'Mer' },
  { value: 'THURSDAY', label: 'Jeu' },
  { value: 'FRIDAY', label: 'Ven' },
  { value: 'SATURDAY', label: 'Sam' },
  { value: 'SUNDAY', label: 'Dim' },
];

// Arithmétique en chaîne yyyy-MM-dd plutôt que `new Date(iso)` : ce dernier
// parse en UTC minuit, ce qui peut décaler la date d'un jour une fois relue
// avec les getters locaux (getDate/getMonth) selon le fuseau — même piège que
// celui déjà évité ailleurs dans la feature (EventForm construit ses dates par
// slice de string, jamais via `new Date(isoString)`).
const addDaysToIsoDate = (iso: string, days: number): string => {
  const parts = iso.split('-').map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return toIsoDate(new Date(year, month - 1, day + days));
};

const toggleWeekday = (joursSemaine: JourSemaine[], day: JourSemaine): JourSemaine[] =>
  joursSemaine.includes(day)
    ? joursSemaine.filter((item) => item !== day)
    : [...joursSemaine, day];

/** Fréquence + jours de la semaine (si hebdo) + date de fin — réutilisé pour créer
 * une série et pour éditer "toute la série" (voir EventForm). */
export const RecurrenceFields: FC<RecurrenceFieldsProps> = ({ value, onChange, startDate }) => (
  <div className="flex flex-col gap-3 rounded-input bg-surface-2 p-3">
    <Select
      id="recurrence-frequence"
      label="Répéter"
      value={value.frequence}
      onChange={(event) =>
        onChange({ ...value, frequence: event.target.value as FrequenceRecurrence })
      }
    >
      {FREQUENCE_LABELS.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </Select>

    {value.frequence === 'HEBDOMADAIRE' && (
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-text">Jours de la semaine</span>
        <div className="flex flex-wrap gap-1">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              aria-pressed={value.joursSemaine.includes(day.value)}
              onClick={() =>
                onChange({ ...value, joursSemaine: toggleWeekday(value.joursSemaine, day.value) })
              }
              className={[
                'rounded-control px-2.5 py-1 text-[13px] font-medium transition-colors',
                value.joursSemaine.includes(day.value)
                  ? 'bg-accent text-white'
                  : 'bg-input text-text-muted hover:text-text',
              ].join(' ')}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    )}

    <TextField
      id="recurrence-fin"
      label="Se termine le"
      type="date"
      required
      min={startDate}
      max={addDaysToIsoDate(startDate, MAX_HORIZON_DAYS)}
      value={value.finRecurrence}
      onChange={(event) => onChange({ ...value, finRecurrence: event.target.value })}
    />
  </div>
);
