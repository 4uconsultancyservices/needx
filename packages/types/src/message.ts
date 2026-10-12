import type { BaseEntity } from './common';
import type { ConversationContextType, MessageKind } from './enums';

export interface Conversation extends BaseEntity {
  contextType: ConversationContextType;
  contextId: string;
  participantIds: string[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
}

export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  text?: string;
  attachmentUrl?: string;
  meta?: Record<string, unknown>; // e.g. offer snapshot for OFFER_CARD
  readBy: string[];
}
