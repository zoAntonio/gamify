import type { FC, ReactNode } from 'react';

interface ListProps {
  children: ReactNode;
  className?: string;
}

export const List: FC<ListProps> = ({ children, className = '' }) => (
  <ul className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>{children}</ul>
);
