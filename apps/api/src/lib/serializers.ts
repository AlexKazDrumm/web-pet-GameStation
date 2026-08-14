import type { Message, Review, Score, User } from '@prisma/client';
import type {
  AdminUser,
  Message as MessageDto,
  PublicUser,
  Review as ReviewDto,
  Score as ScoreDto,
} from '@gamestation/shared';

/** Public display name derived from the email local-part. */
export function displayName(email: string): string {
  const [local] = email.split('@');
  return local && local.length > 0 ? local : email;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toScore(score: Pick<Score, 'game' | 'wins'>): ScoreDto {
  return { game: score.game, wins: score.wins };
}

export function toAdminUser(user: User & { scores: Score[] }): AdminUser {
  return { ...toPublicUser(user), scores: user.scores.map(toScore) };
}

export function toReview(review: Review & { author: Pick<User, 'email'> }): ReviewDto {
  return {
    id: review.id,
    game: review.game,
    text: review.text,
    authorName: displayName(review.author.email),
    createdAt: review.createdAt.toISOString(),
  };
}

export function toMessage(
  message: Message & { sender: Pick<User, 'email'> },
  viewerId: number,
): MessageDto {
  return {
    id: message.id,
    text: message.text,
    senderId: message.senderId,
    recipientId: message.recipientId,
    senderName: displayName(message.sender.email),
    mine: message.senderId === viewerId,
    createdAt: message.createdAt.toISOString(),
  };
}
