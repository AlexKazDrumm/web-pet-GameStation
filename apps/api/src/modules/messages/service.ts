import type {
  MessagesQuery,
  MessagesResponse,
  SendMessageInput,
  SendMessageResponse,
} from '@gamestation/shared';
import type { Role } from '@gamestation/shared';
import { prisma } from '../../db.js';
import { AppError } from '../../http/errors.js';
import { toMessage } from '../../lib/serializers.js';

interface Actor {
  id: number;
  role: Role;
}

const senderSelect = { sender: { select: { email: true } } } as const;

async function resolveRecipient(actor: Actor, requestedRecipientId?: number): Promise<number> {
  if (actor.role === 'ADMIN') {
    if (!requestedRecipientId) {
      throw AppError.badRequest('Администратор должен указать получателя');
    }
    const recipient = await prisma.user.findUnique({ where: { id: requestedRecipientId } });
    if (!recipient) throw AppError.notFound('Получатель не найден');
    return recipient.id;
  }
  // Regular players always write to the support desk (the first admin).
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { id: 'asc' } });
  if (!admin) throw new AppError(503, 'no_admin', 'Служба поддержки временно недоступна');
  return admin.id;
}

export async function sendMessage(
  actor: Actor,
  input: SendMessageInput,
): Promise<SendMessageResponse> {
  const recipientId = await resolveRecipient(actor, input.recipientId);
  const message = await prisma.message.create({
    data: { senderId: actor.id, recipientId, text: input.text },
    include: senderSelect,
  });
  return { message: toMessage(message, actor.id) };
}

export async function listMessages(actor: Actor, query: MessagesQuery): Promise<MessagesResponse> {
  const scopeUserId =
    actor.role === 'ADMIN' && query.withUserId ? query.withUserId : actor.id;
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: scopeUserId }, { recipientId: scopeUserId }] },
    orderBy: { createdAt: 'asc' },
    take: query.limit,
    include: senderSelect,
  });
  return { messages: messages.map((message) => toMessage(message, actor.id)) };
}
