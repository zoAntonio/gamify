import type { FC, ReactNode } from 'react';

interface ListItemProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ListItem: FC<ListItemProps> = ({ children, selected = false, onClick, className = '' }) => {
  const rowClasses = [
    'flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-text transition-colors',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="flex-1">{children}</span>
      {selected && <span className="text-[17px] font-semibold text-accent">✓</span>}
    </>
  );

  if (onClick) {
    return (
      <li>
        <button type="button" onClick={onClick} className={`${rowClasses} active:bg-surface-2`}>
          {content}
        </button>
      </li>
    );
  }

  return <li className={rowClasses}>{content}</li>;
};
