import type {
  CreateReviewInput,
  CreateReviewResponse,
  ReviewsQuery,
  ReviewsResponse,
} from '@gamestation/shared';
import { prisma } from '../../db.js';
import { toReview } from '../../lib/serializers.js';

const authorSelect = { author: { select: { email: true } } } as const;

export async function createReview(
  authorId: number,
  input: CreateReviewInput,
): Promise<CreateReviewResponse> {
  const review = await prisma.review.create({
    data: { authorId, game: input.game, text: input.text },
    include: authorSelect,
  });
  return { review: toReview(review) };
}

export async function listReviews(query: ReviewsQuery): Promise<ReviewsResponse> {
  const reviews = await prisma.review.findMany({
    where: query.game ? { game: query.game } : {},
    orderBy: { createdAt: 'desc' },
    take: query.limit,
    include: authorSelect,
  });
  return { reviews: reviews.map(toReview) };
}
