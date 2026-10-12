import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webpush from 'web-push';

export interface PushSubscriptionKeys {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Thin wrapper around the `web-push` library. Unlike payment/email/SMS,
 * this one is NOT a fake dev stand-in — VAPID keys have no external account
 * tied to them, so real ones are generated at setup time
 * (`pnpm --filter @needx/api run vapid:generate`) and this genuinely sends
 * browser push notifications, including over http://localhost in dev.
 */
@Injectable()
export class PushProvider implements OnModuleInit {
  private readonly logger = new Logger('PushProvider');
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('webPush.publicKey');
    const privateKey = this.config.get<string>('webPush.privateKey');
    const contact = this.config.get<string>('webPush.contactEmail');
    if (publicKey && privateKey) {
      webpush.setVapidDetails(contact ?? 'mailto:admin@needx.local', publicKey, privateKey);
      this.configured = true;
    } else {
      this.logger.warn(
        'WEB_PUSH_PUBLIC_KEY/WEB_PUSH_PRIVATE_KEY not set — push notifications will be skipped. ' +
          'Generate a pair with `pnpm --filter @needx/api run vapid:generate` and add them to .env.',
      );
    }
  }

  get publicKey(): string | undefined {
    return this.config.get<string>('webPush.publicKey');
  }

  async send(subscription: PushSubscriptionKeys, payload: { title: string; body: string; url?: string }): Promise<boolean> {
    if (!this.configured) return false;
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (err) {
      this.logger.warn(`Push send failed for endpoint ${subscription.endpoint.slice(0, 40)}...: ${(err as Error).message}`);
      return false;
    }
  }
}
