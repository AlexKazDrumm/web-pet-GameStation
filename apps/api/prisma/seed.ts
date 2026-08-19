import { type Game, PrismaClient, type Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'demo-password-123';

interface SeedUser {
  email: string;
  role: Role;
  scores: Partial<Record<Game, number>>;
}

const USERS: SeedUser[] = [
  { email: 'admin@gamestation.local', role: 'ADMIN', scores: {} },
  { email: 'nova@example.com', role: 'USER', scores: { TIC_TAC_TOE: 7, ROCK_PAPER_SCISSORS: 4 } },
  { email: 'pixel@example.com', role: 'USER', scores: { TIC_TAC_TOE: 3, ROCK_PAPER_SCISSORS: 9 } },
  { email: 'blitz@example.com', role: 'USER', scores: { TIC_TAC_TOE: 12 } },
  { email: 'echo@example.com', role: 'USER', scores: { ROCK_PAPER_SCISSORS: 5 } },
];

const REVIEWS: Array<{ email: string; game: Game; text: string }> = [
  { email: 'nova@example.com', game: 'TIC_TAC_TOE', text: 'Большое поле реально затягивает, приятно, что можно менять размер.' },
  { email: 'pixel@example.com', game: 'ROCK_PAPER_SCISSORS', text: 'Быстрые раунды, удобно играть в перерыв.' },
  { email: 'blitz@example.com', game: 'TIC_TAC_TOE', text: 'Компьютер грамотно блокирует, лёгкой победы не будет.' },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const seed of USERS) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: { role: seed.role },
      create: { email: seed.email, role: seed.role, passwordHash },
    });

    for (const [game, wins] of Object.entries(seed.scores) as Array<[Game, number]>) {
      await prisma.score.upsert({
        where: { userId_game: { userId: user.id, game } },
        update: { wins },
        create: { userId: user.id, game, wins },
      });
    }
  }

  const hasReviews = await prisma.review.count();
  if (hasReviews === 0) {
    for (const review of REVIEWS) {
      const author = await prisma.user.findUniqueOrThrow({ where: { email: review.email } });
      await prisma.review.create({
        data: { authorId: author.id, game: review.game, text: review.text },
      });
    }
  }

  const hasMessages = await prisma.message.count();
  if (hasMessages === 0) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@gamestation.local' } });
    const nova = await prisma.user.findUniqueOrThrow({ where: { email: 'nova@example.com' } });
    await prisma.message.createMany({
      data: [
        { senderId: nova.id, recipientId: admin.id, text: 'Здравствуйте! Сбросился прогресс в крестиках-ноликах.' },
        { senderId: admin.id, recipientId: nova.id, text: 'Добрый день, счёт восстановлен. Приносим извинения за неудобство.' },
      ],
    });
  }

  const totals = await prisma.user.count();
  console.log(`seed завершён: пользователей — ${totals}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
