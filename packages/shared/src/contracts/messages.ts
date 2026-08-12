import { z } from 'zod';

export const sendMessageInputSchema = z
  .object({
    text: z.string().trim().min(1).max(2000),
    recipientId: z.number().int().positive().optional(),
  })
  .strict();
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

export const messagesQuerySchema = z
  .object({
    withUserId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
  })
  .strict();
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;

export const messageSchema = z.object({
  id: z.number().int().positive(),
  text: z.string(),
  senderId: z.number().int().positive(),
  recipientId: z.number().int().positive(),
  senderName: z.string(),
  mine: z.boolean(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

export const messagesResponseSchema = z.object({
  messages: z.array(messageSchema),
});
export type MessagesResponse = z.infer<typeof messagesResponseSchema>;

export const sendMessageResponseSchema = z.object({
  message: messageSchema,
});
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
