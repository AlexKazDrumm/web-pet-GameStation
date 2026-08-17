import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { leaderboardQuerySchema, recordWinInputSchema } from '@gamestation/shared';
import { asyncHandler } from '../../http/asyncHandler.js';
import { optionalAuth, requireAuth } from '../../http/auth.js';
import { validate } from '../../http/validate.js';
import * as controller from './controller.js';

const winLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Слишком часто, подождите немного' } },
});

export const scoresRouter: Router = Router();

scoresRouter.post(
  '/scores/wins',
  requireAuth,
  winLimiter,
  validate({ body: recordWinInputSchema }),
  asyncHandler(controller.recordWin),
);
scoresRouter.get('/scores/me', requireAuth, asyncHandler(controller.myScores));
scoresRouter.get(
  '/leaderboard',
  optionalAuth,
  validate({ query: leaderboardQuerySchema }),
  asyncHandler(controller.leaderboard),
);
