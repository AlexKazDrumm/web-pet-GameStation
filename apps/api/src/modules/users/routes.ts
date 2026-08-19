import { Router } from 'express';
import { idParamSchema, resetScoreInputSchema, updateUserInputSchema } from '@gamestation/shared';
import { asyncHandler } from '../../http/asyncHandler.js';
import { requireAdmin, requireAuth } from '../../http/auth.js';
import { validate } from '../../http/validate.js';
import * as controller from './controller.js';

export const usersRouter: Router = Router();

usersRouter.use(requireAuth, requireAdmin);

usersRouter.get('/', asyncHandler(controller.list));
usersRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateUserInputSchema }),
  asyncHandler(controller.update),
);
usersRouter.delete('/:id', validate({ params: idParamSchema }), asyncHandler(controller.remove));
usersRouter.post(
  '/:id/scores/reset',
  validate({ params: idParamSchema, body: resetScoreInputSchema }),
  asyncHandler(controller.resetScore),
);
