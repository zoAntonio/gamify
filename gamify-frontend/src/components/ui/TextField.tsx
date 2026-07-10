import type { FC, InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField: FC<TextFieldProps> = ({ label, error, id, className = '', ...rest }) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      <input
        id={id}
        className={[
          'rounded-control border bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-text-muted/60',
          'outline-none transition-colors focus:border-accent',
          error ? 'border-danger' : 'border-border',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
