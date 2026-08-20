import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Load repo-root .env so `npm test` works without extra flags.
loadEnv({ path: '../../.env' });

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['test/global-setup.ts'],
    setupFiles: ['test/setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
});
