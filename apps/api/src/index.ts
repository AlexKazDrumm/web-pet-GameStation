import { createApp } from './app.js';
import { pingDatabase, prisma } from './db.js';
import { env } from './env.js';
import { logger } from './logger.js';

async function main(): Promise<void> {
  const app = createApp();

  if (!(await pingDatabase())) {
    logger.warn('база данных недоступна при старте — проверьте DATABASE_URL и миграции');
  }

  const server = app.listen(env.API_PORT, () => {
    logger.info(`GameStation API слушает порт ${env.API_PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    logger.info({ signal }, 'остановка сервера');
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error: unknown) => {
  logger.error({ err: error }, 'фатальная ошибка при запуске');
  process.exit(1);
});
