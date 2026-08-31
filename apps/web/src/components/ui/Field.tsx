import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';
import styles from './Field.module.css';

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

interface BaseProps {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function TextField({
  label,
  error,
  hint,
  className,
  id,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={cx(styles.control, error && styles.invalid, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {hint && !error && <span className={styles.label}>{hint}</span>}
      {error && (
        <span id={`${fieldId}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  className,
  id,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        id={fieldId}
        className={cx(styles.control, error && styles.invalid, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${fieldId}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}

export function SelectField({
  label,
  error,
  className,
  id,
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <select
        id={fieldId}
        className={cx(styles.control, error && styles.invalid, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span id={`${fieldId}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
