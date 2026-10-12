import type { Conversation as ConversationWire, Message as MessageWire } from '@needx/types';
import type { ConversationDocument } from './schemas/conversation.schema';
import type { MessageDocument } from './schemas/message.schema';
import { toIdString } from '../../common/utils/id.util';

export function toConversationWire(doc: ConversationDocument): ConversationWire {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    contextType: json.contextType,
    contextId: json.contextId,
    participantIds: (json.participantIds ?? []).map((p: any) => toIdString(p)),
    lastMessageAt: json.lastMessageAt,
    lastMessagePreview: json.lastMessagePreview,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

export function toMessageWire(doc: MessageDocument): MessageWire {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    conversationId: toIdString(json.conversationId),
    senderId: toIdString(json.senderId),
    kind: json.kind,
    text: json.text,
    attachmentUrl: json.attachmentUrl,
    meta: json.meta,
    readBy: (json.readBy ?? []).map((p: any) => toIdString(p)),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}
