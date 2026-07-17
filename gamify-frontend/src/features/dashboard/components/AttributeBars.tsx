import type { FC } from 'react';
import type { Attribut } from '@/types/attribut.types';

interface AttributeBarsProps {
  attributs: Record<Attribut, number>;
}

// Ordre fixe (jamais recalculé) — la couleur suit l'attribut, pas son rang.
const ATTRIBUT_ORDER: { key: Attribut; label: string; color: string }[] = [
  { key: 'INT', label: 'Intelligence', color: 'var(--color-int)' },
  { key: 'FOR', label: 'Force', color: 'var(--color-for)' },
  { key: 'VIT', label: 'Vitalité', color: 'var(--color-vit)' },
  { key: 'PRE', label: 'Précision', color: 'var(--color-pre)' },
  { key: 'CHA', label: 'Charisme', color: 'var(--color-cha)' },
  { key: 'RES', label: 'Résistance', color: 'var(--color-res)' },
];

export const AttributeBars: FC<AttributeBarsProps> = ({ attributs }) => {
  const max = Math.max(20, ...Object.values(attributs));

  return (
    <div className="flex flex-col gap-2.5">
      {ATTRIBUT_ORDER.map(({ key, label, color }) => {
        const value = attributs[key];
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[12px] text-text-muted">{label}</span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="absolute inset-y-0 left-0 rounded-r-[4px]"
                style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-[13px] font-semibold tabular-nums text-text">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
