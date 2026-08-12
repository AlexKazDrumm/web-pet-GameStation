import { z } from 'zod';
import { gameSchema } from './common.js';

export const createReviewInputSchema = z
  .object({
    game: gameSchema,
    text: z.string().trim().min(3).max(1000),
  })
  .strict();
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const reviewsQuerySchema = z
  .object({
    game: gameSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();
export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>;

export const reviewSchema = z.object({
  id: z.number().int().positive(),
  game: gameSchema,
  text: z.string(),
  authorName: z.string(),
  createdAt: z.string(),
});
export type Review = z.infer<typeof reviewSchema>;

export const reviewsResponseSchema = z.object({
  reviews: z.array(reviewSchema),
});
export type ReviewsResponse = z.infer<typeof reviewsResponseSchema>;

export const createReviewResponseSchema = z.object({
  review: reviewSchema,
});
export type CreateReviewResponse = z.infer<typeof createReviewResponseSchema>;
