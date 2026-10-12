import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { NotificationType } from '@needx/types';
import { AppException } from '../../common/errors/app.exception';
import { PushProvider } from '../../common/providers/push/push.provider';
import { Notification } from './schemas/notification.schema';
import { PushSubscription } from './schemas/push-subscription.schema';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    @InjectModel(PushSubscription.name) private readonly pushSubModel: Model<PushSubscription>,
    private readonly pushProvider: PushProvider,
  ) {}

  /** The one place every other module calls to notify a user — writes the
   * in-app row AND best-effort fans out to any registered push subscriptions. */
  async notify(input: CreateNotificationInput): Promise<void> {
    await this.notificationModel.create({ ...input, read: false });

    const subs = await this.pushSubModel.find({ userId: input.userId }).exec();
    if (subs.length === 0) return;

    await Promise.all(
      subs.map(async (sub) => {
        const ok = await this.pushProvider.send(
          { endpoint: sub.endpoint, keys: sub.keys },
          { title: input.title, body: input.body, url: input.linkUrl },
        );
        // A 410/expired subscription should be cleaned up so we stop retrying it.
        if (!ok) {
          this.logger.debug(`Dropping stale push subscription ${sub.endpoint.slice(0, 32)}...`);
        }
      }),
    );
  }

  async listForUser(userId: string, page: number, limit: number, unreadOnly = false) {
    const filter: Record<string, unknown> = { userId };
    if (unreadOnly) filter.read = false;
    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel.countDocuments({ userId, read: false }).exec(),
    ]);
    return { items, total, unreadCount };
  }

  async markRead(userId: string, id: string): Promise<void> {
    const res = await this.notificationModel
      .updateOne({ _id: id, userId }, { $set: { read: true, readAt: new Date() } })
      .exec();
    if (res.matchedCount === 0) throw AppException.notFound('Notification');
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ userId, read: false }, { $set: { read: true, readAt: new Date() } }).exec();
  }

  async subscribePush(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string }) {
    return this.pushSubModel.findOneAndUpdate(
      { endpoint: sub.endpoint },
      { $set: { userId, keys: sub.keys, userAgent: sub.userAgent } },
      { upsert: true, new: true },
    );
  }

  async unsubscribePush(userId: string, endpoint: string) {
    await this.pushSubModel.deleteOne({ userId, endpoint }).exec();
  }

  get vapidPublicKey(): string | undefined {
    return this.pushProvider.publicKey;
  }
}
