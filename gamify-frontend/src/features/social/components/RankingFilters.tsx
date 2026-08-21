import type { FC } from 'react';
import { Select } from '@/components/ui/Select';
import type { Attribut } from '@/types/attribut.types';
import type { ClassementSortBy } from '@/features/social/types/social.types';

interface RankingFiltersProps {
  attribut: Attribut | null;
  sortBy: ClassementSortBy;
  onAttributChange: (value: Attribut | null) => void;
  onSortByChange: (value: ClassementSortBy) => void;
}

// Dupliqué volontairement plutôt qu'importé depuis une autre feature (même
// logique que ActivityFilters/frontend-workflow.md : chaque feature reste
// indépendante).
const ATTRIBUT_LABELS: Record<Attribut, string> = {
  INT: 'Intelligence',
  FOR: 'Force',
  VIT: 'Vitalité',
  PRE: 'Précision',
  CHA: 'Charisme',
  RES: 'Résistance',
};

const ATTRIBUTS = Object.keys(ATTRIBUT_LABELS) as Attribut[];

export const RankingFilters: FC<RankingFiltersProps> = ({ attribut, sortBy, onAttributChange, onSortByChange }) => {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full max-w-[220px]">
        <Select
          id="ranking-filter-attribut"
          label="Classement"
          value={attribut ?? ''}
          onChange={(event) => onAttributChange(event.target.value ? (event.target.value as Attribut) : null)}
        >
          <option value="">Général (niveau/XP)</option>
          {ATTRIBUTS.map((value) => (
            <option key={value} value={value}>
              Attribut : {ATTRIBUT_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      {attribut === null && (
        <div className="w-full max-w-[200px]">
          <Select
            id="ranking-filter-sort"
            label="Trier par"
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as ClassementSortBy)}
          >
            <option value="xpTotal">XP total</option>
            <option value="niveau">Niveau</option>
          </Select>
        </div>
      )}
    </div>
  );
};
