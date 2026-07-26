import type { FC, InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField: FC<TextFieldProps> = ({ label, error, id, className = '', ...rest }) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        className={[
          'rounded-input bg-input px-3 py-1.5 text-[14px] text-text shadow-subtle placeholder:text-text-faint',
          'outline-none transition-shadow focus:shadow-subtle-focus focus:ring-2 focus:ring-accent/40',
          error ? 'ring-2 ring-danger/50' : '',
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
