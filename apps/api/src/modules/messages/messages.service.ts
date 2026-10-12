import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { SendMessageInput, StartConversationInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { NeedsService } from '../needs/needs.service';
import { OffersService } from '../offers/offers.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { realtimeBus, REALTIME_EVENTS } from './realtime.bus';
import { toMessageWire } from './messages.mapper';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly needsService: NeedsService,
    private readonly offersService: OffersService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * The gate that satisfies "users must not be able to contact another user
   * outside legitimate marketplace contexts": every conversation is derived
   * FROM an existing Need/Offer/Order the requester is already a party to —
   * there is no "start a DM with anyone" path anywhere in this API.
   */
  private async resolveParticipants(dto: StartConversationInput, requesterId: string): Promise<string[]> {
    if (dto.contextType === 'OFFER') {
      const offer = await this.offersService.findByIdOrThrow(dto.contextId);
      const need = await this.needsService.findByIdOrThrow(offer.needId.toString());
      const participants = [offer.providerId.toString(), need.userId.toString()];
      if (!participants.includes(requesterId)) throw AppException.forbidden('Not part of this offer');
      return participants;
    }
    if (dto.contextType === 'ORDER') {
      const order = await this.ordersService.findByIdOrThrow(dto.contextId);
      const participants = [order.buyerId.toString(), order.providerId.toString()];
      if (!participants.includes(requesterId)) throw AppException.forbidden('Not part of this order');
      return participants;
    }
    // NEED context: only the need owner, or a provider who has already sent
    // a real offer on it (i.e. already a legitimate participant), may open it.
    const need = await this.needsService.findByIdOrThrow(dto.contextId);
    if (need.userId.toString() === requesterId) {
      throw AppException.validation({ contextId: 'Open a conversation from a specific offer instead' });
    }
    const offers = await this.offersService.listForNeed(dto.contextId);
    const hasOffered = offers.some((o) => o.providerId.toString() === requesterId);
    if (!hasOffered) {
      throw AppException.forbidden('Send an offer before starting a conversation about this need');
    }
    return [need.userId.toString(), requesterId];
  }

  async getOrCreateConversation(requesterId: string, dto: StartConversationInput): Promise<ConversationDocument> {
    const existing = await this.conversationModel.findOne({ contextType: dto.contextType, contextId: dto.contextId }).exec();
    if (existing) {
      if (!existing.participantIds.map((p) => p.toString()).includes(requesterId)) {
        throw AppException.forbidden('Not part of this conversation');
      }
      return existing;
    }
    const participantIds = await this.resolveParticipants(dto, requesterId);
    return this.conversationModel.create({ contextType: dto.contextType, contextId: dto.contextId, participantIds });
  }

  async listForUser(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel.find({ participantIds: userId }).sort({ lastMessageAt: -1 }).exec();
  }

  private async assertParticipant(conversationId: string, userId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationModel.findById(conversationId).exec();
    if (!conversation) throw AppException.notFound('Conversation');
    if (!conversation.participantIds.map((p) => p.toString()).includes(userId)) {
      throw AppException.forbidden('Not part of this conversation');
    }
    return conversation;
  }

  async listMessages(conversationId: string, userId: string, page: number, limit: number): Promise<MessageDocument[]> {
    await this.assertParticipant(conversationId, userId);
    return this.messageModel
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async sendMessage(senderId: string, dto: SendMessageInput): Promise<MessageDocument> {
    const conversation = await this.assertParticipant(dto.conversationId, senderId);

    const message = await this.messageModel.create({
      conversationId: dto.conversationId,
      senderId,
      kind: dto.kind ?? 'TEXT',
      text: dto.text,
      attachmentUrl: dto.attachmentUrl,
      readBy: [senderId],
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = (dto.text ?? '[attachment]').slice(0, 140);
    await conversation.save();

    const recipientId = conversation.participantIds.map((p) => p.toString()).find((id) => id !== senderId);
    if (recipientId) {
      await this.notificationsService.notify({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New message',
        body: dto.text ? dto.text.slice(0, 100) : 'Sent an attachment',
        linkUrl: `/dashboard/messages?conversation=${conversation.id}`,
      });
    }

    realtimeBus.emit(REALTIME_EVENTS.MESSAGE_CREATED, {
      conversationId: conversation.id,
      message: toMessageWire(message),
    });

    return message;
  }

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    await this.assertParticipant(conversationId, userId);
    await this.messageModel.updateMany({ conversationId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } }).exec();
  }
}
