import type { FC, HTMLAttributes } from 'react';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

// Bloc générique : la forme (carte, ligne, avatar...) se compose via className depuis l'appelant.
export const Skeleton: FC<SkeletonProps> = ({ className = '', ...rest }) => {
  return (
    <div
      aria-hidden="true"
      className={['animate-pulse rounded-control bg-surface-2', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
};
