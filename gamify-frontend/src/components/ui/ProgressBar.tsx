import type { FC } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

// Progression connue (étapes complétées, % de complétion) — jamais une durée devinée.
export const ProgressBar: FC<ProgressBarProps> = ({ value, max, label, className = '' }) => {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <div className={className}>
      {label && (
        <p className="mb-1.5 text-[13px] text-text-muted">
          {label} ({value}/{max})
        </p>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-1.5 w-full overflow-hidden rounded-input bg-surface-2"
      >
        <div
          className="h-full rounded-input bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
};
