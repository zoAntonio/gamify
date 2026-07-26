import { useState } from 'react';
import type { FC } from 'react';
import type { PeriodeStats, PointProgression } from '@/features/dashboard/types/stats.types';

interface ProgressionChartProps {
  points: PointProgression[];
  periode: PeriodeStats;
  onPeriodeChange: (periode: PeriodeStats) => void;
}

const PERIODES: { value: PeriodeStats; label: string }[] = [
  { value: 'SEMAINE', label: 'Semaine' },
  { value: 'MOIS', label: 'Mois' },
  { value: 'ANNEE', label: 'Année' },
];

const WIDTH = 600;
const HEIGHT = 150;
const PLOT_HEIGHT = 120;

/** Colonne à sommet arrondi (4px), ancrée à la ligne de base. */
const columnPath = (x: number, y: number, width: number, height: number): string => {
  const radius = Math.min(4, width / 2, height);
  const baseline = y + height;
  return [
    `M${x},${baseline}`,
    `L${x},${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `L${x + width - radius},${y}`,
    `Q${x + width},${y} ${x + width},${y + radius}`,
    `L${x + width},${baseline}`,
    'Z',
  ].join(' ');
};

/** XP gagnés par période — série unique (accent), libellé direct sur le max + au survol. */
export const ProgressionChart: FC<ProgressionChartProps> = ({
  points,
  periode,
  onPeriodeChange,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...points.map((point) => point.xpGagne), 1);
  const maxIndex = points.findIndex((point) => point.xpGagne === max);
  const isEmpty = points.every((point) => point.xpGagne === 0);
  const step = WIDTH / Math.max(points.length, 1);
  const barWidth = Math.min(40, step - 2);
  const labelEvery = points.length > 12 ? 5 : 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[16px] font-medium text-heading">XP gagnés</h2>
        <div className="flex rounded-control bg-surface-2 p-0.5 shadow-subtle">
          {PERIODES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={periode === item.value}
              onClick={() => onPeriodeChange(item.value)}
              className={[
                'rounded-control px-3 py-1 text-[12px] font-medium transition-colors',
                periode === item.value ? 'bg-accent text-white' : 'text-text-muted hover:text-text',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <p className="py-8 text-center text-[13px] text-text-faint">
          Pas encore de gains sur cette période — valide une tâche ou coche une habitude.
        </p>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="XP gagnés par période" className="w-full">
          <line
            x1={0}
            y1={PLOT_HEIGHT}
            x2={WIDTH}
            y2={PLOT_HEIGHT}
            stroke="var(--color-border)"
            strokeWidth={1}
          />

          {points.map((point, index) => {
            const height = (point.xpGagne / max) * (PLOT_HEIGHT - 18);
            const x = index * step + (step - barWidth) / 2;
            const y = PLOT_HEIGHT - height;
            const showLabel = hovered === index || (hovered === null && index === maxIndex);
            return (
              <g
                key={point.date}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* zone de survol plus large que la marque */}
                <rect x={index * step} y={0} width={step} height={PLOT_HEIGHT} fill="transparent" />
                {point.xpGagne > 0 && (
                  <path
                    d={columnPath(x, y, barWidth, height)}
                    fill="var(--color-accent)"
                    opacity={hovered === null || hovered === index ? 1 : 0.55}
                  />
                )}
                {showLabel && point.xpGagne > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="fill-text text-[11px] font-semibold tabular-nums"
                  >
                    {point.xpGagne}
                  </text>
                )}
                {index % labelEvery === 0 && (
                  <text
                    x={index * step + step / 2}
                    y={HEIGHT - 6}
                    textAnchor="middle"
                    className="fill-text-faint text-[10px]"
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
