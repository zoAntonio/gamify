import type { FC } from 'react';
import type { Attribut } from '@/types/attribut.types';

interface AttributeRadarProps {
  attributs: Record<Attribut, number>;
}

const AXES: Attribut[] = ['INT', 'FOR', 'VIT', 'PRE', 'CHA', 'RES'];
const CENTER = 120;
const RADIUS = 78;
const RINGS = [0.25, 0.5, 0.75, 1];

const pointAt = (axisIndex: number, ratio: number): [number, number] => {
  const angle = (Math.PI * 2 * axisIndex) / AXES.length - Math.PI / 2;
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio];
};

const toPath = (ratios: number[]): string =>
  ratios
    .map((ratio, index) => {
      const [x, y] = pointAt(index, ratio);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';

/** Radar 6 axes, série unique — accent violet, identité portée par les libellés texte. */
export const AttributeRadar: FC<AttributeRadarProps> = ({ attributs }) => {
  const max = Math.max(20, ...Object.values(attributs));
  const ratios = AXES.map((axe) => attributs[axe] / max);

  return (
    <svg viewBox="0 0 240 240" role="img" aria-label="Radar des attributs" className="w-full max-w-60">
      {RINGS.map((ring) => (
        <path
          key={ring}
          d={toPath(AXES.map(() => ring))}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={1}
        />
      ))}

      {AXES.map((_, index) => {
        const [x, y] = pointAt(index, 1);
        return (
          <line
            key={index}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        );
      })}

      <path
        d={toPath(ratios)}
        fill="var(--color-accent-soft)"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {ratios.map((ratio, index) => {
        const [x, y] = pointAt(index, ratio);
        return (
          <circle
            key={AXES[index]}
            cx={x}
            cy={y}
            r={3.5}
            fill="var(--color-accent)"
            stroke="var(--color-bg)"
            strokeWidth={2}
          />
        );
      })}

      {AXES.map((axe, index) => {
        const [x, y] = pointAt(index, 1.22);
        return (
          <text
            key={axe}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-text-muted text-[11px] font-medium"
          >
            {axe} {attributs[axe]}
          </text>
        );
      })}
    </svg>
  );
};
