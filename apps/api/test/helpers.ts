import type { Express } from 'express';
import supertest from 'supertest';
import type { Role } from '@gamestation/shared';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';
import { signToken } from '../src/lib/jwt.js';
import { hashPassword } from '../src/lib/password.js';

export const app: Express = createApp();
export const api = (): ReturnType<typeof supertest> => supertest(app);

export interface TestUser {
  id: number;
  email: string;
  role: Role;
  token: string;
  password: string;
}

let counter = 0;

export async function createUser(
  overrides: Partial<{ email: string; password: string; role: Role }> = {},
): Promise<TestUser> {
  counter += 1;
  const email = overrides.email ?? `user${counter}@example.com`;
  const password = overrides.password ?? 'sup3r-secret';
  const role = overrides.role ?? 'USER';
  const user = await prisma.user.create({
    data: { email, role, passwordHash: await hashPassword(password) },
  });
  return { id: user.id, email: user.email, role: user.role, password, token: signToken({ sub: user.id, role: user.role }) };
}

export const bearer = (token: string): string => `Bearer ${token}`;
