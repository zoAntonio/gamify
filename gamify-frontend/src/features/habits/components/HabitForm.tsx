import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useHabitDomaines } from '@/features/habits/hooks/useHabitDomaines';
import type { Attribut } from '@/types/attribut.types';
import type { HabitRequest } from '@/features/habits/types/habit.types';

interface HabitFormProps {
  onSubmit: (request: HabitRequest) => void;
  isSubmitting: boolean;
}

// Presets alignés sur les couleurs d'attributs du thème (index.css).
const COLOR_PRESETS = ['#663af3', '#3b9dff', '#ff6b5c', '#34d399', '#f6c945', '#ff5c8a', '#45c2d6'];

export const HabitForm: FC<HabitFormProps> = ({ onSubmit, isSubmitting }) => {
  const { domaines, isLoading: isLoadingDomaines } = useHabitDomaines();
  const [nom, setNom] = useState('');
  const [domaineId, setDomaineId] = useState('');
  const [attributCible, setAttributCible] = useState('');
  const [icone, setIcone] = useState('');
  const [couleur, setCouleur] = useState<string>(COLOR_PRESETS[0] ?? '#663af3');

  const selectedDomaine = domaines.find((domaine) => String(domaine.id) === domaineId);
  const attributOptions = selectedDomaine?.attributs ?? [];

  const handleDomaineChange = (value: string) => {
    setDomaineId(value);
    setAttributCible('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!domaineId || !attributCible) return;

    const trimmedIcone = icone.trim();

    onSubmit({
      nom,
      domaineId: Number(domaineId),
      attributCible: attributCible as Attribut,
      couleur,
      ...(trimmedIcone ? { icone: trimmedIcone } : {}),
    });
  };

  if (isLoadingDomaines) {
    return (
      <p className="flex items-center gap-2 text-[15px] text-text-muted">
        <Spinner size="sm" /> Chargement des domaines...
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <TextField
        id="habit-nom"
        label="Nom de l'habitude"
        placeholder="ex. Lecture"
        required
        value={nom}
        onChange={(event) => setNom(event.target.value)}
      />

      <Select
        id="habit-domaine"
        label="Domaine"
        required
        value={domaineId}
        onChange={(event) => handleDomaineChange(event.target.value)}
      >
        <option value="" disabled>
          Choisis un domaine
        </option>
        {domaines.map((domaine) => (
          <option key={domaine.id} value={domaine.id}>
            {domaine.nom}
          </option>
        ))}
      </Select>

      <Select
        id="habit-attribut"
        label="Attribut ciblé"
        required
        disabled={!selectedDomaine}
        value={attributCible}
        onChange={(event) => setAttributCible(event.target.value)}
      >
        <option value="" disabled>
          {selectedDomaine ? 'Choisis un attribut' : 'Choisis un domaine d’abord'}
        </option>
        {attributOptions.map((attribut) => (
          <option key={attribut} value={attribut}>
            {attribut}
          </option>
        ))}
      </Select>

      <TextField
        id="habit-icone"
        label="Icône (optionnel)"
        placeholder="ex. 📚"
        value={icone}
        onChange={(event) => setIcone(event.target.value)}
      />

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-text-muted">Couleur</legend>
        <div className="flex gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={`Couleur ${preset}`}
              aria-pressed={couleur === preset}
              onClick={() => setCouleur(preset)}
              className={[
                'h-7 w-7 rounded-full transition-transform',
                couleur === preset ? 'scale-110 ring-2 ring-text ring-offset-2 ring-offset-surface-3' : '',
              ].join(' ')}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </fieldset>

      <Button type="submit" isLoading={isSubmitting} disabled={!domaineId || !attributCible}>
        Créer l’habitude
      </Button>
    </form>
  );
};
