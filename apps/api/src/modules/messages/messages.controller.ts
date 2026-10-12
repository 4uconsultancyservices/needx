import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { sendMessageSchema, startConversationSchema, type SendMessageInput, type StartConversationInput } from '@needx/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MessagesService } from './messages.service';
import { toConversationWire, toMessageWire } from './messages.mapper';

/** REST fallback for clients not connected over the socket (or before the
 * socket handshake completes) — same service, same guarantees, just HTTP. */
@Controller('conversations')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(startConversationSchema))
  async start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartConversationInput) {
    const conversation = await this.messagesService.getOrCreateConversation(user.id, dto);
    return toConversationWire(conversation);
  }

  @Get()
  async mine(@CurrentUser() user: AuthenticatedUser) {
    const conversations = await this.messagesService.listForUser(user.id);
    return conversations.map(toConversationWire);
  }

  @Get(':id/messages')
  async messages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '30',
  ) {
    const messages = await this.messagesService.listMessages(id, user.id, Number(page), Number(limit));
    return messages.map(toMessageWire).reverse();
  }

  @Post(':id/messages')
  @UsePipes(new ZodValidationPipe(sendMessageSchema))
  async send(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: SendMessageInput) {
    const message = await this.messagesService.sendMessage(user.id, { ...dto, conversationId: id });
    return toMessageWire(message);
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.messagesService.markConversationRead(id, user.id);
    return { read: true };
  }
}
