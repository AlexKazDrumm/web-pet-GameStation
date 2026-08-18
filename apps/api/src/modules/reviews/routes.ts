import { Router } from 'express';
import { createReviewInputSchema, reviewsQuerySchema } from '@gamestation/shared';
import { asyncHandler } from '../../http/asyncHandler.js';
import { requireAuth } from '../../http/auth.js';
import { validate } from '../../http/validate.js';
import * as controller from './controller.js';

export const reviewsRouter: Router = Router();

reviewsRouter.get('/', validate({ query: reviewsQuerySchema }), asyncHandler(controller.list));
reviewsRouter.post(
  '/',
  requireAuth,
  validate({ body: createReviewInputSchema }),
  asyncHandler(controller.create),
);
