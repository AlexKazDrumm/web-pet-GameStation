import type { Role } from '@gamestation/shared';

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: number; role: Role };
    }
  }
}

export {};
