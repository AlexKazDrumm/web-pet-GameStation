import { execFileSync } from 'node:child_process';

/**
 * Applies migrations once before the API test run.
 * Requires a dedicated database or schema in TEST_DATABASE_URL.
 */
export default function setup(): void {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Для тестов API задайте отдельную TEST_DATABASE_URL');
  }

  const url = new URL(databaseUrl);
  const databaseName = url.pathname.slice(1).toLowerCase();
  const schemaName = (url.searchParams.get('schema') ?? 'public').toLowerCase();
  if (!databaseName.includes('test') && !schemaName.includes('test')) {
    throw new Error('TEST_DATABASE_URL должна указывать на тестовую БД или тестовую схему');
  }

  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(npx, ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
