import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export interface Validated<S extends ValidationSchemas> {
  body: S['body'] extends ZodTypeAny ? z.infer<S['body']> : unknown;
  params: S['params'] extends ZodTypeAny ? z.infer<S['params']> : unknown;
  query: S['query'] extends ZodTypeAny ? z.infer<S['query']> : unknown;
}

const store = new WeakMap<Request, unknown>();

/** Validates request parts and stashes the parsed data for `getValidated`. */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = {
        body: schemas.body ? schemas.body.parse(req.body) : req.body,
        params: schemas.params ? schemas.params.parse(req.params) : req.params,
        query: schemas.query ? schemas.query.parse(req.query) : req.query,
      };
      store.set(req, parsed);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function getValidated<S extends ValidationSchemas>(req: Request): Validated<S> {
  const parsed = store.get(req);
  if (!parsed) {
    throw new Error('getValidated called without a preceding validate() middleware');
  }
  return parsed as Validated<S>;
}
