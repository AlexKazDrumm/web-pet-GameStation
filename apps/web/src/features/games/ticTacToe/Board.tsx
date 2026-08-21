import type { Board as BoardModel } from '@gamestation/shared';
import styles from './Board.module.css';

interface BoardProps {
  board: BoardModel;
  size: number;
  winningLine: readonly number[] | null;
  disabled: boolean;
  onPlay: (index: number) => void;
}

export function Board({ board, size, winningLine, disabled, onPlay }: BoardProps) {
  const winning = new Set(winningLine ?? []);
  return (
    <div
      className={styles.board}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      role="grid"
      aria-label={`Игровое поле ${size} на ${size}`}
    >
      {board.map((cell, index) => {
        const label = cell ?? '';
        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            className={[
              styles.cell,
              cell === 'X' && styles.x,
              cell === 'O' && styles.o,
              winning.has(index) && styles.win,
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={disabled || cell != null}
            aria-label={label ? `Клетка ${index + 1}: ${label}` : `Клетка ${index + 1}: пусто`}
            onClick={() => onPlay(index)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
