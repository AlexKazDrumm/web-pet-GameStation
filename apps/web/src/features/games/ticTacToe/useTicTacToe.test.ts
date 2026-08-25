import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTicTacToe } from './useTicTacToe';

describe('useTicTacToe', () => {
  it('creates a board of the requested size and clamps out-of-range sizes', () => {
    const { result } = renderHook(() => useTicTacToe({ initialSize: 99 }));
    expect(result.current.size).toBe(8);
    expect(result.current.board).toHaveLength(64);
  });

  it('lets the player win a row and reports it once', () => {
    const onPlayerWin = vi.fn();
    const { result } = renderHook(() =>
      // chill computer + fixed rng keeps it away from the top row on a 5x5 board
      useTicTacToe({ initialSize: 5, smart: false, delayMs: 0, rng: () => 0, onPlayerWin }),
    );

    act(() => result.current.play(0));
    act(() => result.current.play(1));
    act(() => result.current.play(2));

    expect(result.current.status).toBe('player-won');
    expect(result.current.winningLine).toEqual([0, 1, 2]);
    expect(onPlayerWin).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks once the game is over', () => {
    const { result } = renderHook(() =>
      useTicTacToe({ initialSize: 5, smart: false, delayMs: 0, rng: () => 0 }),
    );
    act(() => result.current.play(0));
    act(() => result.current.play(1));
    act(() => result.current.play(2));
    const frozen = result.current.board.slice();
    act(() => result.current.play(10));
    expect(result.current.board).toEqual(frozen);
  });

  it('resets the board', () => {
    const { result } = renderHook(() => useTicTacToe({ initialSize: 3, delayMs: 0 }));
    act(() => result.current.play(0));
    act(() => result.current.reset());
    expect(result.current.board.every((cell) => cell === null)).toBe(true);
    expect(result.current.status).toBe('playing');
  });
});
