import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useActivityDomaines } from '@/features/activities/hooks/useActivityDomaines';
import type { Attribut } from '@/types/attribut.types';
import type { ActivityRequest, Frequence } from '@/features/activities/types/activity.types';

interface ActivityFormProps {
  onSubmit: (request: ActivityRequest) => void;
  isSubmitting: boolean;
}

const FREQUENCE_OPTIONS: { value: Frequence; label: string }[] = [
  { value: 'QUOTIDIEN', label: 'Quotidien' },
  { value: 'HEBDOMADAIRE', label: 'Hebdomadaire' },
  { value: 'MENSUEL', label: 'Mensuel' },
];

export const ActivityForm: FC<ActivityFormProps> = ({ onSubmit, isSubmitting }) => {
  const { domaines, isLoading: isLoadingDomaines } = useActivityDomaines();
  const [nom, setNom] = useState('');
  const [domaineId, setDomaineId] = useState('');
  const [attributCible, setAttributCible] = useState('');
  const [frequence, setFrequence] = useState<Frequence>('QUOTIDIEN');
  const [objectif, setObjectif] = useState('');

  const selectedDomaine = domaines.find((domaine) => String(domaine.id) === domaineId);
  const attributOptions = selectedDomaine?.attributs ?? [];

  const handleDomaineChange = (value: string) => {
    setDomaineId(value);
    setAttributCible('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!domaineId || !attributCible) return;

    const trimmedObjectif = objectif.trim();

    onSubmit({
      nom,
      domaineId: Number(domaineId),
      attributCible: attributCible as Attribut,
      frequence,
      ...(trimmedObjectif ? { objectif: trimmedObjectif } : {}),
    });

    setNom('');
    setDomaineId('');
    setAttributCible('');
    setFrequence('QUOTIDIEN');
    setObjectif('');
  };

  if (isLoadingDomaines) return <p className="text-[15px] text-text-muted">Chargement des domaines...</p>;

  return (
    <form className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-glass" onSubmit={handleSubmit}>
      <TextField
        id="activity-nom"
        label="Nom de la tâche"
        placeholder="ex. 10 pompes"
        required
        value={nom}
        onChange={(event) => setNom(event.target.value)}
      />

      <Select
        id="activity-domaine"
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
        id="activity-attribut"
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

      <Select
        id="activity-frequence"
        label="Fréquence"
        required
        value={frequence}
        onChange={(event) => setFrequence(event.target.value as Frequence)}
      >
        {FREQUENCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <TextField
        id="activity-objectif"
        label="Objectif (optionnel)"
        placeholder="ex. 5 exercices"
        value={objectif}
        onChange={(event) => setObjectif(event.target.value)}
      />

      <Button type="submit" disabled={isSubmitting || !domaineId || !attributCible}>
        {isSubmitting ? 'Création...' : 'Ajouter la tâche'}
      </Button>
    </form>
  );
};
