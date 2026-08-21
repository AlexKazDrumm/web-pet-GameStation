import {
  type AdminUserResponse,
  type AdminUsersResponse,
  type AuthResponse,
  type CreateReviewInput,
  type CreateReviewResponse,
  type Game,
  type LeaderboardResponse,
  type LoginInput,
  type MeResponse,
  type MessagesResponse,
  type MyScoresResponse,
  type RecordWinResponse,
  type RegisterInput,
  type ResetScoreInput,
  type ReviewsResponse,
  type Role,
  type SendMessageInput,
  type SendMessageResponse,
  type UpdateUserInput,
  adminUserResponseSchema,
  adminUsersResponseSchema,
  authResponseSchema,
  createReviewResponseSchema,
  leaderboardResponseSchema,
  meResponseSchema,
  messagesResponseSchema,
  myScoresResponseSchema,
  recordWinResponseSchema,
  reviewsResponseSchema,
  sendMessageResponseSchema,
} from '@gamestation/shared';
import { apiRequest } from './client';

export const authApi = {
  register: async (body: RegisterInput): Promise<AuthResponse> =>
    authResponseSchema.parse(await apiRequest('/auth/register', { method: 'POST', body, auth: false })),
  login: async (body: LoginInput): Promise<AuthResponse> =>
    authResponseSchema.parse(await apiRequest('/auth/login', { method: 'POST', body, auth: false })),
  me: async (): Promise<MeResponse> => meResponseSchema.parse(await apiRequest('/auth/me')),
};

export const scoresApi = {
  recordWin: async (game: Game): Promise<RecordWinResponse> =>
    recordWinResponseSchema.parse(
      await apiRequest('/scores/wins', { method: 'POST', body: { game } }),
    ),
  myScores: async (): Promise<MyScoresResponse> =>
    myScoresResponseSchema.parse(await apiRequest('/scores/me')),
  leaderboard: async (game: Game, limit = 20): Promise<LeaderboardResponse> =>
    leaderboardResponseSchema.parse(
      await apiRequest('/leaderboard', { query: { game, limit }, auth: false }),
    ),
};

export const reviewsApi = {
  list: async (game?: Game): Promise<ReviewsResponse> =>
    reviewsResponseSchema.parse(
      await apiRequest('/reviews', { query: game ? { game } : undefined, auth: false }),
    ),
  create: async (body: CreateReviewInput): Promise<CreateReviewResponse> =>
    createReviewResponseSchema.parse(await apiRequest('/reviews', { method: 'POST', body })),
};

export const messagesApi = {
  list: async (withUserId?: number): Promise<MessagesResponse> =>
    messagesResponseSchema.parse(
      await apiRequest('/messages', { query: withUserId ? { withUserId } : undefined }),
    ),
  send: async (body: SendMessageInput): Promise<SendMessageResponse> =>
    sendMessageResponseSchema.parse(await apiRequest('/messages', { method: 'POST', body })),
};

export const usersApi = {
  list: async (): Promise<AdminUsersResponse> =>
    adminUsersResponseSchema.parse(await apiRequest('/users')),
  update: async (id: number, body: UpdateUserInput): Promise<AdminUserResponse> =>
    adminUserResponseSchema.parse(await apiRequest(`/users/${id}`, { method: 'PATCH', body })),
  remove: async (id: number): Promise<void> => {
    await apiRequest(`/users/${id}`, { method: 'DELETE' });
  },
  resetScore: async (id: number, body: ResetScoreInput): Promise<AdminUserResponse> =>
    adminUserResponseSchema.parse(
      await apiRequest(`/users/${id}/scores/reset`, { method: 'POST', body }),
    ),
};

export type { Role };
