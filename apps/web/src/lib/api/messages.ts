import { api } from '../api-client';
import type { Conversation, Message } from '@needx/types';
import type { StartConversationInput } from '@needx/validation';

export const messagesApi = {
  start: (input: StartConversationInput) => api.post<Conversation>('/conversations', input),
  mine: () => api.get<Conversation[]>('/conversations'),
  history: (conversationId: string) => api.get<Message[]>(`/conversations/${conversationId}/messages`),
  send: (conversationId: string, text: string) => api.post<Message>(`/conversations/${conversationId}/messages`, { text }),
  markRead: (conversationId: string) => api.patch<{ read: true }>(`/conversations/${conversationId}/read`),
};
