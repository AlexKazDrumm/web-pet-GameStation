import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginInputSchema, registerInputSchema } from '@gamestation/shared';
import { asyncHandler } from '../../http/asyncHandler.js';
import { requireAuth } from '../../http/auth.js';
import { validate } from '../../http/validate.js';
import * as controller from './controller.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Слишком много попыток, попробуйте позже' } },
});

export const authRouter: Router = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerInputSchema }),
  asyncHandler(controller.register),
);
authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginInputSchema }),
  asyncHandler(controller.login),
);
authRouter.get('/me', requireAuth, asyncHandler(controller.me));
