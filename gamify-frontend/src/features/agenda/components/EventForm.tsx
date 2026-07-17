import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useActivityOptions } from '@/features/agenda/hooks/useActivityOptions';
import type { AgendaEvent, AgendaEventRequest } from '@/features/agenda/types/agenda.types';

interface EventFormProps {
  initialEvent?: AgendaEvent | undefined;
  defaultDate: string; // yyyy-MM-dd
  defaultStartTime: string; // HH:mm
  onSubmit: (request: AgendaEventRequest) => void;
  onDelete?: (() => void) | undefined;
  isSubmitting: boolean;
}

const addOneHour = (time: string): string => {
  const hour = Math.min(Number(time.slice(0, 2)) + 1, 23);
  return `${String(hour).padStart(2, '0')}:${time.slice(3, 5)}`;
};

export const EventForm: FC<EventFormProps> = ({
  initialEvent,
  defaultDate,
  defaultStartTime,
  onSubmit,
  onDelete,
  isSubmitting,
}) => {
  const { activities, isLoading: isLoadingActivities } = useActivityOptions();
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

  const isInvalidRange = heureFin <= heureDebut;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isInvalidRange) return;

    onSubmit({
      titre,
      dateDebut: `${date}T${heureDebut}:00`,
      dateFin: `${date}T${heureFin}:00`,
      ...(activityId ? { activityId: Number(activityId) } : {}),
    });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <TextField
        id="event-titre"
        label="Titre"
        placeholder="ex. Session maths"
        required
        value={titre}
        onChange={(event) => setTitre(event.target.value)}
      />

      <TextField
        id="event-date"
        label="Date"
        type="date"
        required
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />

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

      <div className="mt-1 flex gap-2">
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            className="!text-danger"
            disabled={isSubmitting}
            onClick={onDelete}
          >
            Supprimer
          </Button>
        )}
        <Button type="submit" fullWidth disabled={isSubmitting || isInvalidRange}>
          {isSubmitting ? 'Enregistrement...' : initialEvent ? 'Modifier' : 'Créer l’événement'}
        </Button>
      </div>
    </form>
  );
};
