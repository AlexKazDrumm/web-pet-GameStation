import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../logger.js';

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: AppError['details']): AppError {
    return new AppError(400, 'bad_request', message, details);
  }

  static unauthorized(message = 'Требуется вход в систему'): AppError {
    return new AppError(401, 'unauthorized', message);
  }

  static forbidden(message = 'Недостаточно прав'): AppError {
    return new AppError(403, 'forbidden', message);
  }

  static notFound(message = 'Ресурс не найден'): AppError {
    return new AppError(404, 'not_found', message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, 'conflict', message);
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound('Маршрут не найден'));
}

interface HttpishError {
  status?: number;
  statusCode?: number;
}

function isHttpishError(err: unknown): err is HttpishError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('status' in err || 'statusCode' in err) &&
    (typeof (err as HttpishError).status === 'number' ||
      typeof (err as HttpishError).statusCode === 'number')
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Ошибка валидации запроса',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: { code: 'conflict', message: 'Запись с такими данными уже существует' },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { code: 'not_found', message: 'Ресурс не найден' } });
      return;
    }
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { code: 'bad_json', message: 'Некорректный JSON в теле запроса' } });
    return;
  }

  // body-parser / raw-body errors (payload too large, unsupported charset, ...)
  if (isHttpishError(err)) {
    const status = err.status ?? err.statusCode ?? 400;
    if (status === 413) {
      res.status(413).json({ error: { code: 'payload_too_large', message: 'Тело запроса слишком большое' } });
      return;
    }
    if (status >= 400 && status < 500) {
      res.status(status).json({ error: { code: 'bad_request', message: 'Некорректный запрос' } });
      return;
    }
  }

  logger.error({ err }, 'unhandled error');
  res.status(500).json({ error: { code: 'internal_error', message: 'Внутренняя ошибка сервера' } });
}
