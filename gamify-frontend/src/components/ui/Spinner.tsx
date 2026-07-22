import type { FC } from 'react';

type SpinnerSize = 'sm' | 'md';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
};

// currentColor : hérite la couleur du texte du conteneur (bouton, message...).
export const Spinner: FC<SpinnerProps> = ({ size = 'sm', className = '' }) => {
  return (
    <svg
      role="status"
      aria-label="Chargement"
      className={['animate-spin', SIZE_CLASSES[size], className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
