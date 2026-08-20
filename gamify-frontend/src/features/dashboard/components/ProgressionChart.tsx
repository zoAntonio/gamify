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
const HEIGHT = 170;
/** Ligne de base : XP gagné pousse vers le haut, points d'attributs perdus vers le bas. */
const ZERO_Y = 100;
const GAIN_MAX_HEIGHT = 86;
const LOSS_MAX_HEIGHT = 34;
const PLOT_BOTTOM = ZERO_Y + LOSS_MAX_HEIGHT + 14;
const DAY_LABEL_Y = HEIGHT - 6;

/** Colonne à sommet arrondi (4px), ancrée à la ligne de base — gains (pousse vers le haut). */
const gainColumnPath = (x: number, y: number, width: number, height: number): string => {
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

/** Colonne à base arrondie (4px), ancrée à la ligne de base — pertes (pousse vers le bas). */
const lossColumnPath = (x: number, yTop: number, width: number, height: number): string => {
  const radius = Math.min(4, width / 2, height);
  const bottom = yTop + height;
  return [
    `M${x},${yTop}`,
    `L${x + width},${yTop}`,
    `L${x + width},${bottom - radius}`,
    `Q${x + width},${bottom} ${x + width - radius},${bottom}`,
    `L${x + radius},${bottom}`,
    `Q${x},${bottom} ${x},${bottom - radius}`,
    `L${x},${yTop}`,
    'Z',
  ].join(' ');
};

/**
 * XP gagnés (violet, vers le haut) vs points d'attributs perdus par malus d'inactivité
 * (rouge, vers le bas — G1-T04/G1-T06). Deux échelles indépendantes : l'XP n'est jamais
 * touchée par un malus (voir `InactivityPenaltyService`), donc les deux métriques ne sont
 * pas comparables en valeur absolue — chaque barre porte sa valeur en texte.
 */
export const ProgressionChart: FC<ProgressionChartProps> = ({
  points,
  periode,
  onPeriodeChange,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxXp = Math.max(...points.map((point) => point.xpGagne), 1);
  const maxXpIndex = points.findIndex((point) => point.xpGagne === maxXp && point.xpGagne > 0);
  const maxPertes = Math.max(...points.map((point) => point.pertesAttributs), 1);
  const maxPertesIndex = points.findIndex(
    (point) => point.pertesAttributs === maxPertes && point.pertesAttributs > 0,
  );
  const hasPertes = maxPertesIndex >= 0;
  const isEmpty = points.every((point) => point.xpGagne === 0 && point.pertesAttributs === 0);
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

      <div className="flex items-center gap-4 text-[11px] text-text-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          XP gagné
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
          Points d'attributs perdus (inactivité)
        </span>
      </div>

      {isEmpty ? (
        <p className="py-8 text-center text-[13px] text-text-faint">
          Pas encore de mouvement sur cette période — valide une tâche ou coche une habitude.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="XP gagnés et points d'attributs perdus par période"
          className="w-full"
        >
          <line x1={0} y1={ZERO_Y} x2={WIDTH} y2={ZERO_Y} stroke="var(--color-border)" strokeWidth={1} />

          {points.map((point, index) => {
            const gainHeight = (point.xpGagne / maxXp) * GAIN_MAX_HEIGHT;
            const gainY = ZERO_Y - gainHeight;
            const lossHeight = (point.pertesAttributs / maxPertes) * LOSS_MAX_HEIGHT;
            const x = index * step + (step - barWidth) / 2;
            const showGainLabel = hovered === index || (hovered === null && index === maxXpIndex);
            const showLossLabel = hovered === index || (hovered === null && index === maxPertesIndex);
            const dimmed = hovered !== null && hovered !== index;

            return (
              <g
                key={point.date}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* zone de survol plus large que la marque */}
                <rect x={index * step} y={0} width={step} height={PLOT_BOTTOM} fill="transparent" />

                {point.xpGagne > 0 && (
                  <path
                    d={gainColumnPath(x, gainY, barWidth, gainHeight)}
                    fill="var(--color-accent)"
                    opacity={dimmed ? 0.55 : 1}
                  />
                )}
                {showGainLabel && point.xpGagne > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={gainY - 5}
                    textAnchor="middle"
                    className="fill-text text-[11px] font-semibold tabular-nums"
                  >
                    {point.xpGagne}
                  </text>
                )}

                {point.pertesAttributs > 0 && (
                  <path
                    d={lossColumnPath(x, ZERO_Y, barWidth, lossHeight)}
                    fill="var(--color-danger)"
                    opacity={dimmed ? 0.55 : 1}
                  />
                )}
                {showLossLabel && point.pertesAttributs > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={ZERO_Y + lossHeight + 12}
                    textAnchor="middle"
                    className="fill-danger text-[11px] font-semibold tabular-nums"
                  >
                    −{point.pertesAttributs}
                  </text>
                )}

                {index % labelEvery === 0 && (
                  <text
                    x={index * step + step / 2}
                    y={DAY_LABEL_Y}
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
      {!isEmpty && !hasPertes && (
        <p className="text-[11px] text-text-faint">
          Aucune perte de points sur cette période — continue comme ça !
        </p>
      )}
    </div>
  );
};
