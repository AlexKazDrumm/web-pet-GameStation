import { useCallback, useRef, useState } from 'react';
import {
  type MatchState,
  type RpsMove,
  type RpsOutcome,
  applyOutcome,
  createMatch,
  matchWinner,
  randomMove,
  resolveRound,
} from '@gamestation/shared';

export interface RpsRound {
  player: RpsMove;
  opponent: RpsMove;
  outcome: RpsOutcome;
}

export interface UseRpsOptions {
  target?: number;
  rng?: () => number;
  onMatchWin?: () => void;
}

export interface RockPaperScissorsGame {
  match: MatchState;
  round: RpsRound | null;
  winner: 'PLAYER' | 'OPPONENT' | null;
  target: number;
  playHand: (move: RpsMove) => void;
  reset: () => void;
  setTarget: (target: number) => void;
}

export function useRockPaperScissors(options: UseRpsOptions = {}): RockPaperScissorsGame {
  const { target = 5, rng = Math.random, onMatchWin } = options;
  const [match, setMatch] = useState<MatchState>(() => createMatch(target));
  const [round, setRound] = useState<RpsRound | null>(null);
  const alreadyWon = useRef(false);

  const start = useCallback((nextTarget: number) => {
    alreadyWon.current = false;
    setRound(null);
    setMatch(createMatch(nextTarget));
  }, []);

  const playHand = useCallback(
    (move: RpsMove) => {
      if (matchWinner(match)) return;
      const opponent = randomMove(rng);
      const outcome = resolveRound(move, opponent);
      const next = applyOutcome(match, outcome);
      setRound({ player: move, opponent, outcome });
      setMatch(next);
      if (!alreadyWon.current && matchWinner(next) === 'PLAYER') {
        alreadyWon.current = true;
        onMatchWin?.();
      }
    },
    [match, onMatchWin, rng],
  );

  return {
    match,
    round,
    winner: matchWinner(match),
    target: match.target,
    playHand,
    reset: () => start(match.target),
    setTarget: (value) => start(value),
  };
}
