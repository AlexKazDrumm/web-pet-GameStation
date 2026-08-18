import { Router } from 'express';
import { messagesQuerySchema, sendMessageInputSchema } from '@gamestation/shared';
import { asyncHandler } from '../../http/asyncHandler.js';
import { requireAuth } from '../../http/auth.js';
import { validate } from '../../http/validate.js';
import * as controller from './controller.js';

export const messagesRouter: Router = Router();

messagesRouter.use(requireAuth);
messagesRouter.get('/', validate({ query: messagesQuerySchema }), asyncHandler(controller.list));
messagesRouter.post('/', validate({ body: sendMessageInputSchema }), asyncHandler(controller.send));
