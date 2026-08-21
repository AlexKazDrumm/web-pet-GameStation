import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

export function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div className={cx(styles.card, interactive && styles.interactive, className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className={styles.title}>{children}</h3>;
}
