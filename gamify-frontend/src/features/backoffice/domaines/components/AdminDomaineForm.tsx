import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import type { AdminDomaine, AdminDomaineRequest } from '@/features/backoffice/domaines/types/adminDomaine.types';
import type { Attribut } from '@/types/attribut.types';

interface AdminDomaineFormProps {
  domaine?: AdminDomaine;
  onSubmit: (request: AdminDomaineRequest) => void;
  isSubmitting: boolean;
}

const ATTRIBUT_OPTIONS: Attribut[] = ['INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES'];

export const AdminDomaineForm: FC<AdminDomaineFormProps> = ({ domaine, onSubmit, isSubmitting }) => {
  const [nom, setNom] = useState(domaine?.nom ?? '');
  const [attributs, setAttributs] = useState<Attribut[]>(domaine?.attributs ?? []);

  const toggleAttribut = (attribut: Attribut) => {
    setAttributs((current) =>
      current.includes(attribut) ? current.filter((a) => a !== attribut) : [...current, attribut],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nom.trim() || attributs.length === 0) return;
    onSubmit({ nom: nom.trim(), attributs });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField
        id="admin-domaine-nom"
        label="Nom du domaine"
        placeholder="ex. Musique"
        value={nom}
        onChange={(event) => setNom(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {ATTRIBUT_OPTIONS.map((attribut) => {
          const isSelected = attributs.includes(attribut);
          return (
            <button
              key={attribut}
              type="button"
              onClick={() => toggleAttribut(attribut)}
              aria-pressed={isSelected}
              className={[
                'rounded-input px-3 py-1.5 text-[13px] font-medium transition-colors',
                isSelected ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted shadow-subtle',
              ].join(' ')}
            >
              {attribut}
            </button>
          );
        })}
      </div>

      <Button type="submit" disabled={isSubmitting || !nom.trim() || attributs.length === 0}>
        {isSubmitting ? 'Enregistrement...' : domaine ? 'Enregistrer' : 'Créer le domaine'}
      </Button>
    </form>
  );
};
