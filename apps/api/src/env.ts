import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Load the nearest .env when running from source (repo root or apps/api).
// In containers the variables are already provided by the orchestrator.
for (const candidate of ['.env', '../.env', '../../.env']) {
  const path = resolve(process.cwd(), candidate);
  if (existsSync(path)) {
    loadDotenv({ path });
    break;
  }
}

const WEAK_SECRETS = new Set([
  'secret',
  'changeme',
  'change-me',
  'replace-with-a-long-random-secret-string',
  'your-secret-here',
]);

const csv = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().url()).min(1));

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET должен быть не короче 32 символов'),
    JWT_EXPIRES_IN: z.string().min(1).default('24h'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
    WEB_ORIGIN: csv.default('http://localhost:5173'),
    SEED_PASSWORD: z.string().min(8).default('demo-password-123'),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === 'production' && WEAK_SECRETS.has(value.JWT_SECRET.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET имеет заведомо небезопасное значение',
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  // Values are never printed, only variable names.
  throw new Error(`Некорректная конфигурация окружения:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
