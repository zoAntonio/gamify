import type { FC, ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
  className?: string;
}

export const List: FC<ListProps> = ({ children, className = '' }) => (
  <ul
    className={['divide-y divide-border overflow-hidden rounded-card bg-surface', className]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </ul>
);
