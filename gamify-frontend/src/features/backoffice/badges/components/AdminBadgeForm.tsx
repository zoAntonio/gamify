import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import type {
  BadgeDefinition,
  BadgeDefinitionRequest,
  DomaineOption,
  Palier,
} from '@/features/backoffice/badges/types/adminBadge.types';

interface AdminBadgeFormProps {
  badge?: BadgeDefinition;
  domaines: DomaineOption[];
  onSubmit: (request: BadgeDefinitionRequest) => void;
  isSubmitting: boolean;
}

const PALIER_OPTIONS: Palier[] = ['BRONZE', 'ARGENT', 'OR'];

export const AdminBadgeForm: FC<AdminBadgeFormProps> = ({ badge, domaines, onSubmit, isSubmitting }) => {
  const [domaineId, setDomaineId] = useState<number | ''>(badge?.domaineId ?? domaines[0]?.id ?? '');
  const [palier, setPalier] = useState<Palier>(badge?.palier ?? 'BRONZE');
  const [nom, setNom] = useState(badge?.nom ?? '');
  const [description, setDescription] = useState(badge?.description ?? '');
  const [seuilValidations, setSeuilValidations] = useState(badge?.seuilValidations ?? 5);

  const isValid = domaineId !== '' && nom.trim() !== '' && seuilValidations > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit({
      domaineId,
      palier,
      nom: nom.trim(),
      description: description.trim() || null,
      seuilValidations,
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Select
        id="admin-badge-domaine"
        label="Domaine"
        value={domaineId}
        onChange={(event) => setDomaineId(Number(event.target.value))}
      >
        {domaines.map((domaine) => (
          <option key={domaine.id} value={domaine.id}>
            {domaine.nom}
          </option>
        ))}
      </Select>

      <Select
        id="admin-badge-palier"
        label="Palier"
        value={palier}
        onChange={(event) => setPalier(event.target.value as Palier)}
      >
        {PALIER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>

      <TextField
        id="admin-badge-nom"
        label="Nom du badge"
        placeholder="ex. Sport - Bronze"
        value={nom}
        onChange={(event) => setNom(event.target.value)}
      />

      <TextField
        id="admin-badge-description"
        label="Description (facultative)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <TextField
        id="admin-badge-seuil"
        label="Seuil de validations"
        type="number"
        min={1}
        value={seuilValidations}
        onChange={(event) => setSeuilValidations(Number(event.target.value))}
      />

      <Button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? 'Enregistrement...' : badge ? 'Enregistrer' : 'Créer le badge'}
      </Button>
    </form>
  );
};
