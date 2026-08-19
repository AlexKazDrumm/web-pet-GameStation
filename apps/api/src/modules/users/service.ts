import type {
  AdminUserResponse,
  AdminUsersResponse,
  Game,
  UpdateUserInput,
} from '@gamestation/shared';
import { prisma } from '../../db.js';
import { AppError } from '../../http/errors.js';
import { toAdminUser } from '../../lib/serializers.js';

const withScores = { scores: { orderBy: { game: 'asc' } } } as const;

async function loadAdminUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, include: withScores });
  if (!user) throw AppError.notFound('Пользователь не найден');
  return user;
}

export async function listUsers(): Promise<AdminUsersResponse> {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' }, include: withScores });
  return { users: users.map(toAdminUser) };
}

export async function updateUser(
  id: number,
  actingAdminId: number,
  input: UpdateUserInput,
): Promise<AdminUserResponse> {
  await loadAdminUser(id);
  if (id === actingAdminId && input.role === 'USER') {
    throw AppError.badRequest('Нельзя понизить собственную роль');
  }
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
    },
    include: withScores,
  });
  return { user: toAdminUser(user) };
}

export async function deleteUser(id: number, actingAdminId: number): Promise<void> {
  if (id === actingAdminId) {
    throw AppError.badRequest('Нельзя удалить собственную учётную запись');
  }
  await loadAdminUser(id);
  await prisma.user.delete({ where: { id } });
}

export async function resetScore(id: number, game: Game): Promise<AdminUserResponse> {
  await loadAdminUser(id);
  await prisma.score.upsert({
    where: { userId_game: { userId: id, game } },
    create: { userId: id, game, wins: 0 },
    update: { wins: 0 },
  });
  const user = await loadAdminUser(id);
  return { user: toAdminUser(user) };
}
