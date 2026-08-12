import { z } from 'zod';

export const GAMES = ['TIC_TAC_TOE', 'ROCK_PAPER_SCISSORS'] as const;
export const gameSchema = z.enum(GAMES);
export type Game = z.infer<typeof gameSchema>;

export const GAME_LABELS: Record<Game, string> = {
  TIC_TAC_TOE: 'Крестики-нолики',
  ROCK_PAPER_SCISSORS: 'Камень-ножницы-бумага',
};

export const ROLES = ['USER', 'ADMIN'] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const publicUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  role: roleSchema,
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const healthSchema = z.object({
  status: z.literal('ok'),
  db: z.boolean(),
  uptime: z.number(),
});
export type Health = z.infer<typeof healthSchema>;
