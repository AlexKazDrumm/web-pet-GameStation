import type { Request, Response } from 'express';
import { type leaderboardQuerySchema, type recordWinInputSchema } from '@gamestation/shared';
import { AppError } from '../../http/errors.js';
import { getValidated } from '../../http/validate.js';
import * as service from './service.js';

export async function recordWin(req: Request, res: Response): Promise<void> {
  if (!req.auth) throw AppError.unauthorized();
  const { body } = getValidated<{ body: typeof recordWinInputSchema }>(req);
  res.status(200).json(await service.recordWin(req.auth.userId, body.game));
}

export async function myScores(req: Request, res: Response): Promise<void> {
  if (!req.auth) throw AppError.unauthorized();
  res.status(200).json(await service.myScores(req.auth.userId));
}

export async function leaderboard(req: Request, res: Response): Promise<void> {
  const { query } = getValidated<{ query: typeof leaderboardQuerySchema }>(req);
  res.status(200).json(await service.leaderboard(query.game, query.limit));
}
