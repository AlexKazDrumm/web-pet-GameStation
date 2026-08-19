import type { Request, Response } from 'express';
import { type idParamSchema, type resetScoreInputSchema, type updateUserInputSchema } from '@gamestation/shared';
import { AppError } from '../../http/errors.js';
import { getValidated } from '../../http/validate.js';
import * as service from './service.js';

function actingAdminId(req: Request): number {
  if (!req.auth) throw AppError.unauthorized();
  return req.auth.userId;
}

export async function list(_req: Request, res: Response): Promise<void> {
  res.status(200).json(await service.listUsers());
}

export async function update(req: Request, res: Response): Promise<void> {
  const { params, body } = getValidated<{
    params: typeof idParamSchema;
    body: typeof updateUserInputSchema;
  }>(req);
  res.status(200).json(await service.updateUser(params.id, actingAdminId(req), body));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { params } = getValidated<{ params: typeof idParamSchema }>(req);
  await service.deleteUser(params.id, actingAdminId(req));
  res.status(204).send();
}

export async function resetScore(req: Request, res: Response): Promise<void> {
  const { params, body } = getValidated<{
    params: typeof idParamSchema;
    body: typeof resetScoreInputSchema;
  }>(req);
  res.status(200).json(await service.resetScore(params.id, body.game));
}
