import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MESSAGE_KINDS, type MessageKind } from '@needx/types';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true }) conversationId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) senderId!: Types.ObjectId;

  @Prop({ type: String, enum: MESSAGE_KINDS, default: 'TEXT' }) kind!: MessageKind;
  @Prop() text?: string;
  @Prop() attachmentUrl?: string;
  @Prop({ type: Object }) meta?: Record<string, unknown>;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] }) readBy!: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
  _id!: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: 1 });
