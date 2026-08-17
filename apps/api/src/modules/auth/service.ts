import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from '@gamestation/shared';
import { prisma } from '../../db.js';
import { AppError } from '../../http/errors.js';
import { signToken } from '../../lib/jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { toPublicUser } from '../../lib/serializers.js';

// bcrypt hash of a random string — compared against when the email is unknown
// so that login timing does not reveal whether an account exists.
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO7l3q9m1n8p0Q2r4S6t8U0v2W4x6Y8zK';

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('Пользователь с таким email уже зарегистрирован');
  }
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: 'USER',
    },
  });
  return { token: signToken({ sub: user.id, role: user.role }), user: toPublicUser(user) };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordOk = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    throw AppError.unauthorized('Неверный email или пароль');
  }
  return { token: signToken({ sub: user.id, role: user.role }), user: toPublicUser(user) };
}

export async function currentUser(userId: number): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.unauthorized();
  }
  return toPublicUser(user);
}
