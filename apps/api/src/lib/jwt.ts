import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { roleSchema } from '@gamestation/shared';
import { env } from '../env.js';

const payloadSchema = z.object({
  sub: z.number().int().positive(),
  role: roleSchema,
});

export type TokenPayload = z.infer<typeof payloadSchema>;

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return payloadSchema.parse(decoded);
}
