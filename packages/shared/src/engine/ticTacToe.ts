export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export const MIN_BOARD_SIZE = 3;
export const MAX_BOARD_SIZE = 8;
export const DEFAULT_STREAK = 3;

export interface WinnerResult {
  player: Player;
  line: number[];
}

export function createBoard(size: number): Board {
  assertSize(size);
  return Array.from({ length: size * size }, () => null);
}

export function assertSize(size: number): void {
  if (!Number.isInteger(size) || size < MIN_BOARD_SIZE || size > MAX_BOARD_SIZE) {
    throw new RangeError(`Размер поля должен быть целым от ${MIN_BOARD_SIZE} до ${MAX_BOARD_SIZE}`);
  }
}

/** Все выигрышные линии длиной `streak` на поле `size` x `size`. */
export function winningLines(size: number, streak: number = DEFAULT_STREAK): number[][] {
  assertSize(size);
  const lines: number[][] = [];
  const at = (r: number, c: number): number => r * size + c;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      for (const [dr, dc] of directions) {
        const endRow = row + dr * (streak - 1);
        const endCol = col + dc * (streak - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
        const line: number[] = [];
        for (let step = 0; step < streak; step += 1) {
          line.push(at(row + dr * step, col + dc * step));
        }
        lines.push(line);
      }
    }
  }
  return lines;
}

export function findWinner(
  board: Board,
  size: number,
  streak: number = DEFAULT_STREAK,
): WinnerResult | null {
  for (const line of winningLines(size, streak)) {
    const firstIndex = line[0];
    if (firstIndex === undefined) continue;
    const mark = board[firstIndex];
    if (!mark) continue;
    if (line.every((index) => board[index] === mark)) {
      return { player: mark, line };
    }
  }
  return null;
}

export function emptyCells(board: Board): number[] {
  const result: number[] = [];
  board.forEach((cell, index) => {
    if (cell === null) result.push(index);
  });
  return result;
}

export function isDraw(board: Board, size: number, streak: number = DEFAULT_STREAK): boolean {
  return emptyCells(board).length === 0 && findWinner(board, size, streak) === null;
}

export function withMove(board: Board, index: number, player: Player): Board {
  if (board[index] !== null) {
    throw new Error(`Клетка ${index} уже занята`);
  }
  const next = board.slice();
  next[index] = player;
  return next;
}

export interface ComputerMoveOptions {
  streak?: number;
  rng?: () => number;
  /** When true (default) the computer takes wins and blocks threats. */
  smart?: boolean;
}

/**
 * Ход компьютера: (в умном режиме) выиграть, если можно; иначе заблокировать;
 * далее центр, угол, случайная клетка. `rng` вынесен для детерминированных тестов.
 */
export function computerMove(
  board: Board,
  size: number,
  me: Player,
  opponent: Player,
  options: ComputerMoveOptions = {},
): number | null {
  const { streak = DEFAULT_STREAK, rng = Math.random, smart = true } = options;
  const available = emptyCells(board);
  if (available.length === 0) return null;

  if (smart) {
    for (const index of available) {
      if (findWinner(withMove(board, index, me), size, streak)) return index;
    }
    for (const index of available) {
      if (findWinner(withMove(board, index, opponent), size, streak)) return index;
    }
  }

  if (size % 2 === 1) {
    const center = Math.floor((size * size) / 2);
    if (board[center] === null) return center;
  }

  const corners = [0, size - 1, size * (size - 1), size * size - 1].filter(
    (index) => board[index] === null,
  );
  const pool = corners.length > 0 ? corners : available;
  return pool[Math.floor(rng() * pool.length)] ?? null;
}
