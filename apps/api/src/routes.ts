import { Router } from 'express';
import { authRouter } from './modules/auth/routes.js';
import { healthRouter } from './modules/health/routes.js';
import { messagesRouter } from './modules/messages/routes.js';
import { reviewsRouter } from './modules/reviews/routes.js';
import { scoresRouter } from './modules/scores/routes.js';
import { usersRouter } from './modules/users/routes.js';

export const apiRouter: Router = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/', scoresRouter);
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/messages', messagesRouter);
apiRouter.use('/users', usersRouter);
