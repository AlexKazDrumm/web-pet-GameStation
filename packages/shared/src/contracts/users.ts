import { z } from 'zod';
import { emailSchema } from './auth.js';
import { gameSchema, publicUserSchema, roleSchema } from './common.js';
import { scoreSchema } from './scores.js';

export const adminUserSchema = publicUserSchema.extend({
  scores: z.array(scoreSchema),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminUsersResponseSchema = z.object({
  users: z.array(adminUserSchema),
});
export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;

export const updateUserInputSchema = z
  .object({
    email: emailSchema.optional(),
    role: roleSchema.optional(),
  })
  .strict()
  .refine((value) => value.email !== undefined || value.role !== undefined, {
    message: 'Нужно передать email или role',
  });
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const resetScoreInputSchema = z
  .object({
    game: gameSchema,
  })
  .strict();
export type ResetScoreInput = z.infer<typeof resetScoreInputSchema>;

export const adminUserResponseSchema = z.object({
  user: adminUserSchema,
});
export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;
