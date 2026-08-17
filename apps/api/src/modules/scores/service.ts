import {
  GAMES,
  type Game,
  type LeaderboardResponse,
  type MyScoresResponse,
  type RecordWinResponse,
} from '@gamestation/shared';
import { prisma } from '../../db.js';
import { displayName, toScore } from '../../lib/serializers.js';

export async function recordWin(userId: number, game: Game): Promise<RecordWinResponse> {
  const score = await prisma.score.upsert({
    where: { userId_game: { userId, game } },
    create: { userId, game, wins: 1 },
    update: { wins: { increment: 1 } },
    select: { game: true, wins: true },
  });
  return { score: toScore(score) };
}

export async function myScores(userId: number): Promise<MyScoresResponse> {
  const rows = await prisma.score.findMany({
    where: { userId },
    select: { game: true, wins: true },
  });
  const byGame = new Map(rows.map((row) => [row.game, row.wins] as const));
  return { scores: GAMES.map((game) => ({ game, wins: byGame.get(game) ?? 0 })) };
}

export async function leaderboard(game: Game, limit: number): Promise<LeaderboardResponse> {
  const rows = await prisma.score.findMany({
    where: { game, wins: { gt: 0 } },
    orderBy: [{ wins: 'desc' }, { id: 'asc' }],
    take: limit,
    select: { wins: true, user: { select: { email: true } } },
  });
  return {
    game,
    entries: rows.map((row, index) => ({
      rank: index + 1,
      name: displayName(row.user.email),
      wins: row.wins,
    })),
  };
}
