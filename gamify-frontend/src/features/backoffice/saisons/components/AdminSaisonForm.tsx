import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import type { CreateSaisonRequest } from '@/features/backoffice/saisons/types/adminSaison.types';

interface AdminSaisonFormProps {
  onSubmit: (request: CreateSaisonRequest) => void;
  isSubmitting: boolean;
}

export const AdminSaisonForm: FC<AdminSaisonFormProps> = ({ onSubmit, isSubmitting }) => {
  const [nom, setNom] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const isValid = nom.trim() !== '' && dateDebut !== '' && dateFin !== '' && dateFin > dateDebut;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit({ nom: nom.trim(), dateDebut, dateFin });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField
        id="admin-saison-nom"
        label="Nom de la saison"
        placeholder="ex. Saison 2"
        value={nom}
        onChange={(event) => setNom(event.target.value)}
      />
      <TextField
        id="admin-saison-debut"
        label="Date de début"
        type="date"
        value={dateDebut}
        onChange={(event) => setDateDebut(event.target.value)}
      />
      <TextField
        id="admin-saison-fin"
        label="Date de fin"
        type="date"
        value={dateFin}
        error={dateFin && dateFin <= dateDebut ? 'Doit être après la date de début' : undefined}
        onChange={(event) => setDateFin(event.target.value)}
      />
      <Button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? 'Création...' : 'Créer la saison'}
      </Button>
    </form>
  );
};
