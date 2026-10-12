import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CONVERSATION_CONTEXT_TYPES, type ConversationContextType } from '@needx/types';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  @Prop({ type: String, enum: CONVERSATION_CONTEXT_TYPES, required: true }) contextType!: ConversationContextType;
  @Prop({ required: true, index: true }) contextId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true }) participantIds!: Types.ObjectId[];

  @Prop() lastMessageAt?: Date;
  @Prop() lastMessagePreview?: string;

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ contextType: 1, contextId: 1 }, { unique: true });
ConversationSchema.index({ participantIds: 1, lastMessageAt: -1 });
