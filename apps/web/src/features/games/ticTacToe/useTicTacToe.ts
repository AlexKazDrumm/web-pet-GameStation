import { useCallback, useRef, useState } from 'react';
import {
  type Board,
  DEFAULT_STREAK,
  MAX_BOARD_SIZE,
  MIN_BOARD_SIZE,
  type Player,
  computerMove,
  createBoard,
  findWinner,
  isDraw,
  withMove,
} from '@gamestation/shared';

export type TicTacToeStatus = 'playing' | 'thinking' | 'player-won' | 'computer-won' | 'draw';

const HUMAN: Player = 'X';
const CPU: Player = 'O';

export interface UseTicTacToeOptions {
  initialSize?: number;
  smart?: boolean;
  delayMs?: number;
  rng?: () => number;
  onPlayerWin?: () => void;
}

export interface TicTacToeGame {
  size: number;
  smart: boolean;
  board: Board;
  status: TicTacToeStatus;
  winningLine: readonly number[] | null;
  locked: boolean;
  play: (index: number) => void;
  reset: () => void;
  setSize: (size: number) => void;
  setSmart: (smart: boolean) => void;
}

function clampSize(value: number): number {
  return Math.min(MAX_BOARD_SIZE, Math.max(MIN_BOARD_SIZE, Math.round(value)));
}

export function useTicTacToe(options: UseTicTacToeOptions = {}): TicTacToeGame {
  const { initialSize = 3, delayMs = 320, rng = Math.random, onPlayerWin } = options;

  const [size, setSizeState] = useState(() => clampSize(initialSize));
  const [smart, setSmart] = useState(options.smart ?? true);
  const [board, setBoard] = useState<Board>(() => createBoard(clampSize(initialSize)));
  const [status, setStatus] = useState<TicTacToeStatus>('playing');
  const [winningLine, setWinningLine] = useState<readonly number[] | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = (): void => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const startFresh = useCallback((nextSize: number) => {
    clearTimer();
    setSizeState(nextSize);
    setBoard(createBoard(nextSize));
    setWinningLine(null);
    setStatus('playing');
  }, []);

  const reset = useCallback(() => startFresh(size), [size, startFresh]);
  const setSize = useCallback((value: number) => startFresh(clampSize(value)), [startFresh]);

  const runComputer = useCallback(
    (current: Board) => {
      const index = computerMove(current, size, CPU, HUMAN, { streak: DEFAULT_STREAK, smart, rng });
      if (index === null) {
        setStatus('draw');
        return;
      }
      const next = withMove(current, index, CPU);
      setBoard(next);
      const win = findWinner(next, size, DEFAULT_STREAK);
      if (win) {
        setWinningLine(win.line);
        setStatus('computer-won');
      } else if (isDraw(next, size, DEFAULT_STREAK)) {
        setStatus('draw');
      } else {
        setStatus('playing');
      }
    },
    [rng, size, smart],
  );

  const play = useCallback(
    (index: number) => {
      if (status !== 'playing' || board[index] != null) return;

      const afterHuman = withMove(board, index, HUMAN);
      setBoard(afterHuman);

      const humanWin = findWinner(afterHuman, size, DEFAULT_STREAK);
      if (humanWin) {
        setWinningLine(humanWin.line);
        setStatus('player-won');
        onPlayerWin?.();
        return;
      }
      if (isDraw(afterHuman, size, DEFAULT_STREAK)) {
        setStatus('draw');
        return;
      }

      if (delayMs <= 0) {
        runComputer(afterHuman);
        return;
      }
      setStatus('thinking');
      timer.current = setTimeout(() => {
        timer.current = null;
        runComputer(afterHuman);
      }, delayMs);
    },
    [board, delayMs, onPlayerWin, runComputer, size, status],
  );

  return {
    size,
    smart,
    board,
    status,
    winningLine,
    locked: status === 'thinking',
    play,
    reset,
    setSize,
    setSmart: (value: boolean) => {
      setSmart(value);
      startFresh(size);
    },
  };
}
