import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { PushSubscription, PushSubscriptionSchema } from './schemas/push-subscription.schema';
import { PushProvider } from '../../common/providers/push/push.provider';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
