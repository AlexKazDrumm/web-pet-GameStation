import type { RequestHandler } from 'express';
import { prisma } from '../db.js';
import { verifyToken } from '../lib/jwt.js';
import { asyncHandler } from './asyncHandler.js';
import { AppError } from './errors.js';

function readBearer(header: string | undefined): string | null {
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

/** Requires a valid JWT; attaches `req.auth`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = readBearer(req.headers.authorization);
  if (!token) {
    next(AppError.unauthorized());
    return;
  }
  try {
    const payload = verifyToken(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized('Недействительный или просроченный токен'));
  }
};

/** Populates `req.auth` when a valid token is present, but never rejects. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = readBearer(req.headers.authorization);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.auth = { userId: payload.sub, role: payload.role };
    } catch {
      // ignore — treated as anonymous
    }
  }
  next();
};

/** Requires an authenticated admin, re-checked against the database. */
export const requireAdmin: RequestHandler = asyncHandler(async (req, _res, next) => {
  if (!req.auth) {
    next(AppError.unauthorized());
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user || user.role !== 'ADMIN') {
    next(AppError.forbidden());
    return;
  }
  next();
});
