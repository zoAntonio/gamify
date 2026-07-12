import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { List } from '@/components/ui/List';
import { ListItem } from '@/components/ui/ListItem';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import type { Attribut, Domaine } from '@/features/profile/types/profile.types';

interface DomainSelectorProps {
  domaines: Domaine[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onCreateDomaine: (nom: string, attributs: Attribut[]) => void;
  isCreating: boolean;
}

const ATTRIBUT_OPTIONS: Attribut[] = ['INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES'];

export const DomainSelector: FC<DomainSelectorProps> = ({
  domaines,
  selectedIds,
  onToggle,
  onCreateDomaine,
  isCreating,
}) => {
  const [nom, setNom] = useState('');
  const [attributs, setAttributs] = useState<Attribut[]>([]);

  const toggleAttribut = (attribut: Attribut) => {
    setAttributs((current) =>
      current.includes(attribut) ? current.filter((a) => a !== attribut) : [...current, attribut],
    );
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nom.trim() || attributs.length === 0) return;
    onCreateDomaine(nom.trim(), attributs);
    setNom('');
    setAttributs([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <List>
        {domaines.map((domaine) => (
          <ListItem
            key={domaine.id}
            selected={selectedIds.includes(domaine.id)}
            onClick={() => onToggle(domaine.id)}
          >
            {domaine.nom} <span className="text-text-muted">({domaine.attributs.join(', ')})</span>
            {!domaine.systeme && <span className="ml-2 text-[13px] text-text-muted">— perso</span>}
          </ListItem>
        ))}
      </List>

      <form className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-glass" onSubmit={handleCreate}>
        <TextField
          id="domaine-nom"
          label="Nouveau domaine"
          placeholder="ex. Dessin"
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

        <Button type="submit" disabled={isCreating || !nom.trim() || attributs.length === 0}>
          {isCreating ? 'Création...' : 'Ajouter ce domaine'}
        </Button>
      </form>
    </div>
  );
};
