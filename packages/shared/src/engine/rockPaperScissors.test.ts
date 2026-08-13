import { describe, expect, it } from 'vitest';
import {
  type MatchState,
  type RpsMove,
  applyOutcome,
  createMatch,
  isMatchOver,
  matchWinner,
  randomMove,
  resolveRound,
} from './rockPaperScissors.js';

describe('resolveRound', () => {
  it('is a tie for equal moves', () => {
    for (const move of ['ROCK', 'PAPER', 'SCISSORS'] as RpsMove[]) {
      expect(resolveRound(move, move)).toBe('TIE');
    }
  });

  it('covers the full win/lose matrix', () => {
    expect(resolveRound('ROCK', 'SCISSORS')).toBe('WIN');
    expect(resolveRound('PAPER', 'ROCK')).toBe('WIN');
    expect(resolveRound('SCISSORS', 'PAPER')).toBe('WIN');
    expect(resolveRound('SCISSORS', 'ROCK')).toBe('LOSE');
    expect(resolveRound('ROCK', 'PAPER')).toBe('LOSE');
    expect(resolveRound('PAPER', 'SCISSORS')).toBe('LOSE');
  });
});

describe('randomMove', () => {
  it('maps the rng range onto the three moves', () => {
    expect(randomMove(() => 0)).toBe('ROCK');
    expect(randomMove(() => 0.5)).toBe('PAPER');
    expect(randomMove(() => 0.99)).toBe('SCISSORS');
  });
});

describe('match lifecycle', () => {
  it('createMatch validates the target', () => {
    expect(createMatch(3)).toEqual({ playerScore: 0, opponentScore: 0, target: 3 });
    expect(() => createMatch(0)).toThrow(RangeError);
    expect(() => createMatch(51)).toThrow(RangeError);
  });

  it('applyOutcome only moves the relevant score and is immutable', () => {
    const start = createMatch(3);
    expect(applyOutcome(start, 'WIN')).toEqual({ playerScore: 1, opponentScore: 0, target: 3 });
    expect(applyOutcome(start, 'LOSE')).toEqual({ playerScore: 0, opponentScore: 1, target: 3 });
    expect(applyOutcome(start, 'TIE')).toBe(start);
    expect(start.playerScore).toBe(0);
  });

  it('detects the match winner and completion', () => {
    const running: MatchState = { playerScore: 2, opponentScore: 1, target: 3 };
    expect(matchWinner(running)).toBeNull();
    expect(isMatchOver(running)).toBe(false);

    const finished: MatchState = { playerScore: 3, opponentScore: 1, target: 3 };
    expect(matchWinner(finished)).toBe('PLAYER');
    expect(isMatchOver(finished)).toBe(true);
  });
});
