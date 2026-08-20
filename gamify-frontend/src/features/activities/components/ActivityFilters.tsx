import type { FC } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useActivityDomaines } from '@/features/activities/hooks/useActivityDomaines';
import type { Attribut } from '@/types/attribut.types';
import type { ActivitySort } from '@/features/activities/types/activity.types';

interface ActivityFiltersProps {
  domaineId: number | null;
  attributCible: Attribut | null;
  sort: ActivitySort;
  hasActiveFilters: boolean;
  onDomaineChange: (value: number | null) => void;
  onAttributChange: (value: Attribut | null) => void;
  onSortChange: (value: ActivitySort) => void;
  onReset: () => void;
}

// Dupliqué volontairement plutôt qu'importé depuis features/dashboard — chaque
// feature reste indépendante (voir frontend-workflow.md, même logique que
// activityService.listDomaines pour /api/domaines).
const ATTRIBUT_LABELS: Record<Attribut, string> = {
  INT: 'Intelligence',
  FOR: 'Force',
  VIT: 'Vitalité',
  PRE: 'Présence',
  CHA: 'Charisme',
  RES: 'Résistance',
};

const ATTRIBUTS = Object.keys(ATTRIBUT_LABELS) as Attribut[];

// "échéance" absent volontairement : pas de champ date d'échéance sur Activity
// (voir roadmap.md, dette G1-T09).
const SORT_OPTIONS: { value: ActivitySort; label: string }[] = [
  { value: '', label: 'Par défaut' },
  { value: 'createdAt,desc', label: 'Création : plus récentes d’abord' },
  { value: 'createdAt,asc', label: 'Création : plus anciennes d’abord' },
  { value: 'statut,asc', label: 'Statut : à faire → terminé' },
  { value: 'statut,desc', label: 'Statut : terminé → à faire' },
];

export const ActivityFilters: FC<ActivityFiltersProps> = ({
  domaineId,
  attributCible,
  sort,
  hasActiveFilters,
  onDomaineChange,
  onAttributChange,
  onSortChange,
  onReset,
}) => {
  const { domaines, isLoading: isLoadingDomaines } = useActivityDomaines();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full max-w-[200px]">
        <Select
          id="activity-filter-domaine"
          label="Domaine"
          disabled={isLoadingDomaines}
          value={domaineId !== null ? String(domaineId) : ''}
          onChange={(event) => onDomaineChange(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Tous les domaines</option>
          {domaines.map((domaine) => (
            <option key={domaine.id} value={domaine.id}>
              {domaine.nom}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full max-w-[200px]">
        <Select
          id="activity-filter-attribut"
          label="Attribut"
          value={attributCible ?? ''}
          onChange={(event) => onAttributChange(event.target.value ? (event.target.value as Attribut) : null)}
        >
          <option value="">Tous les attributs</option>
          {ATTRIBUTS.map((attribut) => (
            <option key={attribut} value={attribut}>
              {ATTRIBUT_LABELS[attribut]}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full max-w-[240px]">
        <Select
          id="activity-filter-sort"
          label="Trier par"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ActivitySort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {hasActiveFilters && (
        <Button type="button" variant="ghost" className="!px-3 !py-1.5 text-[13px]" onClick={onReset}>
          Réinitialiser
        </Button>
      )}
    </div>
  );
};
