import type { Request, Response } from 'express';
import { type messagesQuerySchema, type sendMessageInputSchema } from '@gamestation/shared';
import { AppError } from '../../http/errors.js';
import { getValidated } from '../../http/validate.js';
import * as service from './service.js';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.auth) throw AppError.unauthorized();
  const { query } = getValidated<{ query: typeof messagesQuerySchema }>(req);
  const actor = { id: req.auth.userId, role: req.auth.role };
  res.status(200).json(await service.listMessages(actor, query));
}

export async function send(req: Request, res: Response): Promise<void> {
  if (!req.auth) throw AppError.unauthorized();
  const { body } = getValidated<{ body: typeof sendMessageInputSchema }>(req);
  const actor = { id: req.auth.userId, role: req.auth.role };
  res.status(201).json(await service.sendMessage(actor, body));
}
