import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../../guards/ws-jwt.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { sendMessageSchema, startConversationSchema, type SendMessageInput } from '@needx/validation';
import { MessagesService } from './messages.service';
import { realtimeBus, REALTIME_EVENTS } from './realtime.bus';
import { toConversationWire } from './messages.mapper';

const room = (conversationId: string) => `conversation:${conversationId}`;

@WebSocketGateway({
  namespace: '/ws/messages',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger('MessagesGateway');

  constructor(private readonly messagesService: MessagesService) {}

  afterInit() {
    // Bridges MessagesService (persistence) -> live sockets, without the
    // service depending on this gateway. See realtime.bus.ts.
    realtimeBus.on(REALTIME_EVENTS.MESSAGE_CREATED, ({ conversationId, message }) => {
      this.server.to(room(conversationId)).emit('message', message);
    });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  async joinConversation(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string }) {
    const user = (client.data as { user: AuthenticatedUser }).user;
    // Membership is enforced inside listMessages (via assertParticipant) —
    // reuse it rather than duplicating the check. A tiny page size keeps
    // this call cheap; it's only here to authorize the socket room join.
    await this.messagesService.listMessages(body.conversationId, user.id, 1, 1);
    void client.join(room(body.conversationId));
    return { joined: body.conversationId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('start_conversation')
  async startConversation(@ConnectedSocket() client: Socket, @MessageBody() body: unknown) {
    const user = (client.data as { user: AuthenticatedUser }).user;
    const dto = startConversationSchema.parse(body);
    const conversation = await this.messagesService.getOrCreateConversation(user.id, dto);
    void client.join(room(conversation.id));
    return toConversationWire(conversation);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() body: unknown) {
    const user = (client.data as { user: AuthenticatedUser }).user;
    const dto: SendMessageInput = sendMessageSchema.parse(body);
    const message = await this.messagesService.sendMessage(user.id, dto);
    return { id: message.id };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string }) {
    const user = (client.data as { user: AuthenticatedUser }).user;
    client.to(room(body.conversationId)).emit('typing', { userId: user.id, conversationId: body.conversationId });
  }
}
