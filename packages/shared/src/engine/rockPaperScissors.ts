export const RPS_MOVES = ['ROCK', 'PAPER', 'SCISSORS'] as const;
export type RpsMove = (typeof RPS_MOVES)[number];
export type RpsOutcome = 'WIN' | 'LOSE' | 'TIE';

export const RPS_LABELS: Record<RpsMove, string> = {
  ROCK: 'Камень',
  PAPER: 'Бумага',
  SCISSORS: 'Ножницы',
};

const BEATS: Record<RpsMove, RpsMove> = {
  ROCK: 'SCISSORS',
  PAPER: 'ROCK',
  SCISSORS: 'PAPER',
};

export function resolveRound(player: RpsMove, opponent: RpsMove): RpsOutcome {
  if (player === opponent) return 'TIE';
  return BEATS[player] === opponent ? 'WIN' : 'LOSE';
}

export function randomMove(rng: () => number = Math.random): RpsMove {
  return RPS_MOVES[Math.floor(rng() * RPS_MOVES.length)] ?? 'ROCK';
}

export const DEFAULT_MATCH_TARGET = 5;

export interface MatchState {
  playerScore: number;
  opponentScore: number;
  target: number;
}

export function createMatch(target: number = DEFAULT_MATCH_TARGET): MatchState {
  if (!Number.isInteger(target) || target < 1 || target > 50) {
    throw new RangeError('Цель матча должна быть целым от 1 до 50');
  }
  return { playerScore: 0, opponentScore: 0, target };
}

export function applyOutcome(state: MatchState, outcome: RpsOutcome): MatchState {
  if (outcome === 'WIN') return { ...state, playerScore: state.playerScore + 1 };
  if (outcome === 'LOSE') return { ...state, opponentScore: state.opponentScore + 1 };
  return state;
}

export function matchWinner(state: MatchState): 'PLAYER' | 'OPPONENT' | null {
  if (state.playerScore >= state.target) return 'PLAYER';
  if (state.opponentScore >= state.target) return 'OPPONENT';
  return null;
}

export function isMatchOver(state: MatchState): boolean {
  return matchWinner(state) !== null;
}
