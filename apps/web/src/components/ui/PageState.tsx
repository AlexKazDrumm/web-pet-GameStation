import type { ReactNode } from 'react';
import { ApiError } from '../../api/client';
import { Button } from './Button';
import styles from './PageState.module.css';

export function LoadingState({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Что-то пошло не так';
  return (
    <div className={styles.wrap} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <span className={styles.title}>Не удалось загрузить данные</span>
      <span>{message}</span>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'Пока пусто',
  hint,
  action,
}: {
  title?: string;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden="true">
        🕹️
      </span>
      <span className={styles.title}>{title}</span>
      {hint && <span>{hint}</span>}
      {action}
    </div>
  );
}
