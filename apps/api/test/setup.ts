import { beforeAll, beforeEach } from 'vitest';

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret-value-that-is-long-enough-x';
process.env.WEB_ORIGIN ??= 'http://localhost:5173';
process.env.BCRYPT_ROUNDS ??= '4';

// Imported after env is prepared.
const { prisma } = await import('../src/db.js');

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "messages", "reviews", "scores", "users" RESTART IDENTITY CASCADE',
  );
});
