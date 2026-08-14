import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler.js';
import { pingDatabase } from '../../db.js';

export const healthRouter: Router = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const db = await pingDatabase();
    res.status(db ? 200 : 503).json({ status: 'ok', db, uptime: Math.round(process.uptime()) });
  }),
);
