import type { Request, Response } from 'express';
import { type createReviewInputSchema, type reviewsQuerySchema } from '@gamestation/shared';
import { AppError } from '../../http/errors.js';
import { getValidated } from '../../http/validate.js';
import * as service from './service.js';

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.auth) throw AppError.unauthorized();
  const { body } = getValidated<{ body: typeof createReviewInputSchema }>(req);
  res.status(201).json(await service.createReview(req.auth.userId, body));
}

export async function list(req: Request, res: Response): Promise<void> {
  const { query } = getValidated<{ query: typeof reviewsQuerySchema }>(req);
  res.status(200).json(await service.listReviews(query));
}
