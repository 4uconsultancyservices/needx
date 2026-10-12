import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('unread') unread?: string,
  ) {
    const { items, total, unreadCount } = await this.notificationsService.listForUser(
      user.id,
      Number(page),
      Number(limit),
      unread === 'true',
    );
    return { data: items, meta: { total, unreadCount, page: Number(page), limit: Number(limit), hasMore: Number(page) * Number(limit) < total } };
  }

  @Get('vapid-public-key')
  vapidKey() {
    return { publicKey: this.notificationsService.vapidPublicKey ?? null };
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.notificationsService.markRead(user.id, id);
    return { read: true };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: AuthenticatedUser) {
    await this.notificationsService.markAllRead(user.id);
    return { read: true };
  }

  @Post('push-subscriptions')
  async subscribe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string },
  ) {
    await this.notificationsService.subscribePush(user.id, body);
    return { subscribed: true };
  }

  @Delete('push-subscriptions')
  async unsubscribe(@CurrentUser() user: AuthenticatedUser, @Body('endpoint') endpoint: string) {
    await this.notificationsService.unsubscribePush(user.id, endpoint);
    return { unsubscribed: true };
  }
}
