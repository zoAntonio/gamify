import type { FC, ReactNode } from 'react';

interface ListItemProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ListItem: FC<ListItemProps> = ({ children, selected = false, onClick, className = '' }) => {
  const itemClasses = [
    'flex w-full items-center gap-3 rounded-control border px-4 py-3 text-sm transition-colors',
    selected ? 'border-accent bg-accent-soft text-text' : 'border-border bg-surface-2 text-text-muted',
    onClick ? 'cursor-pointer hover:border-accent/40 hover:text-text' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <li>
        <button type="button" onClick={onClick} className={`${itemClasses} text-left`}>
          {children}
        </button>
      </li>
    );
  }

  return <li className={itemClasses}>{children}</li>;
};
