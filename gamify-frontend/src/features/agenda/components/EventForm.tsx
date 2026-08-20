import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useActivityOptions } from '@/features/agenda/hooks/useActivityOptions';
import { RecurrenceFields } from '@/features/agenda/components/RecurrenceFields';
import { toIsoDate } from '@/features/agenda/utils/date';
import type {
  AgendaEvent,
  AgendaEventRequest,
  AgendaSeriesUpdateRequest,
  RecurrenceRule,
} from '@/features/agenda/types/agenda.types';

interface EventFormProps {
  initialEvent?: AgendaEvent | undefined;
  defaultDate: string; // yyyy-MM-dd
  defaultStartTime: string; // HH:mm
  onSubmit: (request: AgendaEventRequest) => void;
  onSubmitSeries?: (request: AgendaSeriesUpdateRequest) => void;
  onDelete?: (() => void) | undefined;
  onDeleteSeries?: (() => void) | undefined;
  isSubmitting: boolean;
}

type EditScope = 'occurrence' | 'serie';

const addOneHour = (time: string): string => {
  const hour = Math.min(Number(time.slice(0, 2)) + 1, 23);
  return `${String(hour).padStart(2, '0')}:${time.slice(3, 5)}`;
};

const buildInitialRecurrence = (event: AgendaEvent | undefined, fallbackDate: string): RecurrenceRule => ({
  frequence: event?.frequenceRecurrence ?? 'HEBDOMADAIRE',
  joursSemaine: event?.joursSemaine ?? [],
  finRecurrence: event?.finRecurrence ?? fallbackDate,
});

/** Bascule "Cette occurrence" / "Toute la série", affichée seulement pour l'édition
 * d'un événement récurrent (voir AC "modifier/supprimer une occurrence"). */
const ScopeToggle: FC<{ scope: EditScope; onChange: (scope: EditScope) => void }> = ({
  scope,
  onChange,
}) => (
  <div className="flex rounded-control bg-surface-2 p-0.5 shadow-subtle">
    {([
      { value: 'occurrence', label: 'Cette occurrence' },
      { value: 'serie', label: 'Toute la série' },
    ] as const).map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={scope === option.value}
        onClick={() => onChange(option.value)}
        className={[
          'flex-1 rounded-control px-3 py-1.5 text-[13px] font-medium transition-colors',
          scope === option.value ? 'bg-accent text-white' : 'text-text-muted hover:text-text',
        ].join(' ')}
      >
        {option.label}
      </button>
    ))}
  </div>
);

interface DeleteActionsProps {
  isRecurringEvent: boolean;
  onDelete?: (() => void) | undefined;
  onDeleteSeries?: (() => void) | undefined;
  isSubmitting: boolean;
}

/** Un seul bouton "Supprimer" pour un événement libre, deux pour une occurrence
 * récurrente ("cette occurrence" / "toute la série"). */
const DeleteActions: FC<DeleteActionsProps> = ({
  isRecurringEvent,
  onDelete,
  onDeleteSeries,
  isSubmitting,
}) => {
  if (!isRecurringEvent) {
    return onDelete ? (
      <Button
        type="button"
        variant="ghost"
        className="!text-danger"
        disabled={isSubmitting}
        onClick={onDelete}
      >
        Supprimer
      </Button>
    ) : null;
  }

  return (
    <>
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          className="!text-danger"
          disabled={isSubmitting}
          onClick={onDelete}
        >
          Supprimer cette occurrence
        </Button>
      )}
      {onDeleteSeries && (
        <Button
          type="button"
          variant="ghost"
          className="!text-danger"
          disabled={isSubmitting}
          onClick={onDeleteSeries}
        >
          Supprimer toute la série
        </Button>
      )}
    </>
  );
};

export const EventForm: FC<EventFormProps> = ({
  initialEvent,
  defaultDate,
  defaultStartTime,
  onSubmit,
  onSubmitSeries,
  onDelete,
  onDeleteSeries,
  isSubmitting,
}) => {
  const { activities, isLoading: isLoadingActivities } = useActivityOptions();
  const isEditing = initialEvent !== undefined;
  const isRecurringEvent = isEditing && initialEvent.serieId !== null;

  const [scope, setScope] = useState<EditScope>('occurrence');
  const [repeat, setRepeat] = useState(false);
  const [titre, setTitre] = useState(initialEvent?.titre ?? '');
  const [date, setDate] = useState(initialEvent?.dateDebut.slice(0, 10) ?? defaultDate);
  const [heureDebut, setHeureDebut] = useState(
    initialEvent?.dateDebut.slice(11, 16) ?? defaultStartTime,
  );
  const [heureFin, setHeureFin] = useState(
    initialEvent?.dateFin.slice(11, 16) ?? addOneHour(defaultStartTime),
  );
  const [activityId, setActivityId] = useState(
    initialEvent?.activityId !== null && initialEvent !== undefined
      ? String(initialEvent.activityId)
      : '',
  );
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(() =>
    buildInitialRecurrence(initialEvent, date),
  );

  const isSeriesScope = isRecurringEvent && scope === 'serie';
  const isInvalidRange = heureFin <= heureDebut;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isInvalidRange) return;

    if (isSeriesScope) {
      onSubmitSeries?.({
        titre,
        heureDebut: `${heureDebut}:00`,
        heureFin: `${heureFin}:00`,
        ...(activityId ? { activityId: Number(activityId) } : {}),
        recurrence,
      });
      return;
    }

    onSubmit({
      titre,
      dateDebut: `${date}T${heureDebut}:00`,
      dateFin: `${date}T${heureFin}:00`,
      ...(activityId ? { activityId: Number(activityId) } : {}),
      ...(!isEditing && repeat ? { recurrence } : {}),
    });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      {isRecurringEvent && <ScopeToggle scope={scope} onChange={setScope} />}

      <TextField
        id="event-titre"
        label="Titre"
        placeholder="ex. Session maths"
        required
        value={titre}
        onChange={(event) => setTitre(event.target.value)}
      />

      {!isSeriesScope && (
        <TextField
          id="event-date"
          label="Date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="event-debut"
          label="Début"
          type="time"
          required
          value={heureDebut}
          onChange={(event) => setHeureDebut(event.target.value)}
        />
        <TextField
          id="event-fin"
          label="Fin"
          type="time"
          required
          {...(isInvalidRange ? { error: 'La fin doit être après le début' } : {})}
          value={heureFin}
          onChange={(event) => setHeureFin(event.target.value)}
        />
      </div>

      <Select
        id="event-activity"
        label="Lier à une tâche (optionnel)"
        disabled={isLoadingActivities}
        value={activityId}
        onChange={(event) => setActivityId(event.target.value)}
      >
        <option value="">Aucune tâche liée</option>
        {activities.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.nom}
          </option>
        ))}
      </Select>

      {!isEditing && (
        <label className="flex items-center gap-2 text-[13px] font-medium text-text">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-accent"
            checked={repeat}
            onChange={(event) => setRepeat(event.target.checked)}
          />
          Répéter cet événement
        </label>
      )}

      {(isSeriesScope || (!isEditing && repeat)) && (
        <RecurrenceFields
          value={recurrence}
          onChange={setRecurrence}
          startDate={isSeriesScope ? toIsoDate(new Date()) : date}
        />
      )}

      <div className="mt-1 flex flex-wrap gap-2">
        <DeleteActions
          isRecurringEvent={isRecurringEvent}
          onDelete={onDelete}
          onDeleteSeries={onDeleteSeries}
          isSubmitting={isSubmitting}
        />
        <Button type="submit" fullWidth disabled={isSubmitting || isInvalidRange}>
          {isSubmitting
            ? 'Enregistrement...'
            : isSeriesScope
              ? 'Modifier la série'
              : isEditing
                ? 'Modifier'
                : 'Créer l’événement'}
        </Button>
      </div>
    </form>
  );
};
