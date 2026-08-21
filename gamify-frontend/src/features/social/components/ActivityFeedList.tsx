import type { FC } from 'react';
import type { Attribut } from '@/types/attribut.types';
import type { ActivityFeedEntry } from '@/features/social/types/social.types';

interface ActivityFeedListProps {
  entries: ActivityFeedEntry[];
}

// Dupliqué volontairement (même logique que RankingFilters/ActivityFilters) —
// pas de couleur pour PRE (jaune) volontairement gardée identique aux autres
// dashboards (voir dette dataviz roadmap.md, palette produit non retouchée ici).
const ATTRIBUT_LABELS: Record<Attribut, string> = {
  INT: 'Intelligence',
  FOR: 'Force',
  VIT: 'Vitalité',
  PRE: 'Précision',
  CHA: 'Charisme',
  RES: 'Résistance',
};

const ATTRIBUT_COLORS: Record<Attribut, string> = {
  INT: 'var(--color-int)',
  FOR: 'var(--color-for)',
  VIT: 'var(--color-vit)',
  PRE: 'var(--color-pre)',
  CHA: 'var(--color-cha)',
  RES: 'var(--color-res)',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ActivityFeedList: FC<ActivityFeedListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <p className="rounded-control bg-surface p-6 text-center text-[15px] text-text-muted shadow-glass">
        Aucune action récente à afficher — seules les actions des profils publics apparaissent ici.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry, index) => (
        <li
          key={`${entry.username}-${entry.date}-${index}`}
          className="flex items-center gap-3 rounded-control border border-border bg-surface px-4 py-3"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: ATTRIBUT_COLORS[entry.attribut] }}
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-[14px] text-text">
              <span className="font-medium text-heading">{entry.username}</span> a validé « {entry.source} »
            </p>
            <p className="text-[12px] text-text-muted">
              +{entry.delta} {ATTRIBUT_LABELS[entry.attribut]} · {formatDate(entry.date)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};
