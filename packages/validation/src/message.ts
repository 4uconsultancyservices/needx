import { z } from 'zod';
import { CONVERSATION_CONTEXT_TYPES } from '@needx/types';

export const startConversationSchema = z.object({
  contextType: z.enum(CONVERSATION_CONTEXT_TYPES),
  contextId: z.string().min(1),
});
export type StartConversationInput = z.infer<typeof startConversationSchema>;

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  text: z.string().min(1).max(4000).optional(),
  attachmentUrl: z.string().url().optional(),
  kind: z.enum(['TEXT', 'IMAGE', 'FILE']).optional().default('TEXT'),
}).refine((m) => !!m.text || !!m.attachmentUrl, {
  message: 'Message must have text or an attachment',
  path: ['text'],
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
