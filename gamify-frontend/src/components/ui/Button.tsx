import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-[0_8px_24px_-8px_rgba(79,109,245,0.6)]',
  secondary: 'bg-surface-2 text-text border border-border hover:border-accent/60',
  ghost: 'bg-transparent text-text-muted hover:text-text',
};

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-control px-5 py-3 text-sm font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    fullWidth ? 'w-full' : '',
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
