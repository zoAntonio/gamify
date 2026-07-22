import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

// Void Violet reste le seul accent chromatique : il est réservé au CTA principal (primary).
// secondary/ghost restent monochromes (verre givré) pour ne pas diluer l'accent.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'rounded-input bg-accent text-white shadow-subtle active:bg-accent-hover',
  secondary:
    'rounded-full bg-surface-2 text-white shadow-subtle active:bg-[#bad6f71f]',
  ghost: 'rounded-full bg-transparent text-text shadow-subtle active:text-accent-hover',
};

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  children,
  ...rest
}) => {
  const classes = [
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-40',
    fullWidth ? 'w-full' : '',
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || isLoading} {...rest}>
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
};
