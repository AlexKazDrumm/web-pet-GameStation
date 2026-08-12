import { z } from 'zod';
import { gameSchema } from './common.js';

export const recordWinInputSchema = z
  .object({
    game: gameSchema,
  })
  .strict();
export type RecordWinInput = z.infer<typeof recordWinInputSchema>;

export const scoreSchema = z.object({
  game: gameSchema,
  wins: z.number().int().nonnegative(),
});
export type Score = z.infer<typeof scoreSchema>;

export const myScoresResponseSchema = z.object({
  scores: z.array(scoreSchema),
});
export type MyScoresResponse = z.infer<typeof myScoresResponseSchema>;

export const recordWinResponseSchema = z.object({
  score: scoreSchema,
});
export type RecordWinResponse = z.infer<typeof recordWinResponseSchema>;

export const leaderboardQuerySchema = z
  .object({
    game: gameSchema,
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  name: z.string(),
  wins: z.number().int().nonnegative(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const leaderboardResponseSchema = z.object({
  game: gameSchema,
  entries: z.array(leaderboardEntrySchema),
});
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
