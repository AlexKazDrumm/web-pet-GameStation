import { describe, expect, it } from 'vitest';
import {
  type Board,
  type Player,
  assertSize,
  computerMove,
  createBoard,
  emptyCells,
  findWinner,
  isDraw,
  winningLines,
  withMove,
} from './ticTacToe.js';

function boardFrom(rows: string[]): Board {
  return rows
    .join('')
    .split('')
    .map((char) => (char === '.' ? null : (char as Player)));
}

describe('createBoard / assertSize', () => {
  it('creates an empty square board', () => {
    expect(createBoard(3)).toEqual(Array.from({ length: 9 }, () => null));
    expect(createBoard(5)).toHaveLength(25);
  });

  it('rejects sizes outside 3..8', () => {
    expect(() => assertSize(2)).toThrow(RangeError);
    expect(() => assertSize(9)).toThrow(RangeError);
    expect(() => assertSize(3.5)).toThrow(RangeError);
  });
});

describe('winningLines', () => {
  it('produces the 8 classic lines on a 3x3 board', () => {
    expect(winningLines(3)).toHaveLength(8);
  });

  it('scales with board size and includes both diagonals', () => {
    const lines = winningLines(4);
    // rows: 4*2, cols: 4*2, main diagonals: 4, anti diagonals: 4
    expect(lines).toHaveLength(24);
    expect(lines).toContainEqual([0, 5, 10]);
    expect(lines).toContainEqual([2, 5, 8]);
  });
});

describe('findWinner', () => {
  it('detects a row win', () => {
    const board = boardFrom(['XXX', 'OO.', '...']);
    expect(findWinner(board, 3)).toEqual({ player: 'X', line: [0, 1, 2] });
  });

  it('detects a column win', () => {
    const board = boardFrom(['O.X', 'O.X', 'O..']);
    expect(findWinner(board, 3)?.player).toBe('O');
  });

  it('detects a diagonal win on a larger board', () => {
    const board = boardFrom(['X...', '.X..', '..X.', '....']);
    expect(findWinner(board, 4)).toEqual({ player: 'X', line: [0, 5, 10] });
  });

  it('detects an anti-diagonal win', () => {
    const board = boardFrom(['..X', '.X.', 'X..']);
    expect(findWinner(board, 3)).toEqual({ player: 'X', line: [2, 4, 6] });
  });

  it('returns null when there is no line', () => {
    const board = boardFrom(['XO.', 'OX.', '..O']);
    expect(findWinner(board, 3)).toBeNull();
  });

  it('does not report a win for three non-adjacent same marks', () => {
    const board = boardFrom(['X.X', '.X.', '...']);
    expect(findWinner(board, 3)).toBeNull();
  });
});

describe('isDraw / emptyCells / withMove', () => {
  it('reports a draw only on a full board with no winner', () => {
    expect(isDraw(boardFrom(['XOX', 'XOO', 'OXX']), 3)).toBe(true);
    // not full yet
    expect(isDraw(boardFrom(['XOX', 'XO.', 'OXX']), 3)).toBe(false);
    // full board but X has the main diagonal
    expect(isDraw(boardFrom(['XOX', 'OXO', 'XOX']), 3)).toBe(false);
  });

  it('lists empty cells', () => {
    expect(emptyCells(boardFrom(['X.O', '...', 'O.X']))).toEqual([1, 3, 4, 5, 7]);
  });

  it('withMove is immutable and rejects occupied cells', () => {
    const board = createBoard(3);
    const next = withMove(board, 4, 'X');
    expect(board[4]).toBeNull();
    expect(next[4]).toBe('X');
    expect(() => withMove(next, 4, 'O')).toThrow();
  });
});

describe('computerMove', () => {
  const opts = { rng: () => 0 };

  it('takes an immediate winning move', () => {
    const board = boardFrom(['XX.', 'OO.', '...']);
    expect(computerMove(board, 3, 'X', 'O', opts)).toBe(2);
  });

  it('blocks the opponent when it cannot win', () => {
    const board = boardFrom(['OO.', 'X..', '...']);
    expect(computerMove(board, 3, 'X', 'O', opts)).toBe(2);
  });

  it('skips win/block logic when smart is disabled', () => {
    const board = boardFrom(['OO.', 'X..', '...']);
    // center is free on a 3x3 board, so the chill computer grabs it instead of blocking
    expect(computerMove(board, 3, 'X', 'O', { ...opts, smart: false })).toBe(4);
  });

  it('prefers the center on an empty odd board', () => {
    expect(computerMove(createBoard(3), 3, 'O', 'X', opts)).toBe(4);
  });

  it('returns null on a full board', () => {
    expect(computerMove(boardFrom(['XOX', 'XOO', 'OXX']), 3, 'X', 'O', opts)).toBeNull();
  });
});
