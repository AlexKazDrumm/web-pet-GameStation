import type { Request, Response } from 'express';
import { type loginInputSchema, type registerInputSchema } from '@gamestation/shared';
import { AppError } from '../../http/errors.js';
import { getValidated } from '../../http/validate.js';
import * as service from './service.js';

export async function register(req: Request, res: Response): Promise<void> {
  const { body } = getValidated<{ body: typeof registerInputSchema }>(req);
  res.status(201).json(await service.register(body));
}

export async function login(req: Request, res: Response): Promise<void> {
  const { body } = getValidated<{ body: typeof loginInputSchema }>(req);
  res.status(200).json(await service.login(body));
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.auth) throw AppError.unauthorized();
  res.status(200).json({ user: await service.currentUser(req.auth.userId) });
}
