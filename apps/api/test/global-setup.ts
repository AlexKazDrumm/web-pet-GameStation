import { execFileSync } from 'node:child_process';

/**
 * Applies migrations once before the API test run.
 * Requires a reachable PostgreSQL in DATABASE_URL (or TEST_DATABASE_URL).
 */
export default function setup(): void {
  const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Для тестов API задайте TEST_DATABASE_URL или DATABASE_URL');
  }
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
    shell: process.platform === 'win32',
  });
}
