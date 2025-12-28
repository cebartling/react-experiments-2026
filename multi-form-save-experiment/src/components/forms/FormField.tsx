import type { ReactNode, InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: FieldError;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="mb-5">
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold tracking-tight text-surface-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="mb-2 text-sm text-surface-500" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-600"
          id={`${htmlFor}-error`}
          role="alert"
        >
          <svg
            className="h-4 w-4 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError, className = '', ...props },
  ref
) {
  const baseClasses = `
    block w-full rounded-lg border bg-white px-4 py-2.5
    text-base text-surface-900 placeholder-surface-400
    shadow-input transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-surface-500
  `;
  const stateClasses = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 focus:shadow-none'
    : 'border-surface-300 hover:border-surface-400 focus:border-primary-500 focus:ring-primary-100 focus:shadow-input-focus';

  return (
    <input
      ref={ref}
      className={`${baseClasses} ${stateClasses} ${className}`}
      aria-invalid={hasError}
      {...props}
    />
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { hasError, options, className = '', ...props },
  ref
) {
  const baseClasses = `
    block w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10
    text-base text-surface-900
    shadow-input transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-surface-500
    bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20fill%3d%22none%22%20viewBox%3d%220%200%2024%2024%22%20stroke-width%3d%222%22%20stroke%3d%22%2394a3b8%22%3e%3cpath%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%20d%3d%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%2f%3e%3c%2fsvg%3e')]
    bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat
  `;
  const stateClasses = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 focus:shadow-none'
    : 'border-surface-300 hover:border-surface-400 focus:border-primary-500 focus:ring-primary-100 focus:shadow-input-focus';

  return (
    <select
      ref={ref}
      className={`${baseClasses} ${stateClasses} ${className}`}
      aria-invalid={hasError}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = '', ...props },
  ref
) {
  return (
    <label
      className={`group inline-flex cursor-pointer items-center gap-3 rounded-lg p-2 -ml-2 transition-colors hover:bg-surface-100 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-surface-300 bg-white transition-all duration-200 checked:border-primary-600 checked:bg-primary-600 hover:border-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-surface-100"
          {...props}
        />
        <svg
          className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-surface-700 transition-colors group-hover:text-surface-900">
        {label}
      </span>
    </label>
  );
});
