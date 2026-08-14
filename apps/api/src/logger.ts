import { pino } from 'pino';
import { isProduction, isTest } from './env.js';

export const logger = pino({
  level: isTest ? 'silent' : isProduction ? 'info' : 'debug',
  base: undefined,
  redact: {
    paths: ['req.headers.authorization', 'password', 'token', '*.password', '*.passwordHash'],
    remove: true,
  },
});
