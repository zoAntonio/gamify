import { useState } from 'react';
import type { FC, FormEvent } from 'react';
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
    <div className="domain-selector">
      <ul className="domain-list">
        {domaines.map((domaine) => (
          <li key={domaine.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedIds.includes(domaine.id)}
                onChange={() => onToggle(domaine.id)}
              />
              {domaine.nom} ({domaine.attributs.join(', ')})
              {!domaine.systeme && <span className="domain-custom-tag"> — perso</span>}
            </label>
          </li>
        ))}
      </ul>

      <form className="domain-create-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nouveau domaine (ex. Dessin)"
          value={nom}
          onChange={(event) => setNom(event.target.value)}
        />
        <div className="attribut-checkboxes">
          {ATTRIBUT_OPTIONS.map((attribut) => (
            <label key={attribut}>
              <input
                type="checkbox"
                checked={attributs.includes(attribut)}
                onChange={() => toggleAttribut(attribut)}
              />
              {attribut}
            </label>
          ))}
        </div>
        <button type="submit" disabled={isCreating || !nom.trim() || attributs.length === 0}>
          {isCreating ? 'Création...' : 'Ajouter ce domaine'}
        </button>
      </form>
    </div>
  );
};
