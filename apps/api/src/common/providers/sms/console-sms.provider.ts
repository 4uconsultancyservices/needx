import { Injectable, Logger } from '@nestjs/common';
import type { SmsProvider } from './sms-provider.interface';

/** Dev-mode default — logs OTP/SMS content instead of calling a paid SMS vendor. */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger('SmsProvider(console)');

  async send(to: string, body: string): Promise<void> {
    this.logger.log(`\n--- SMS (dev fallback, no SMS_PROVIDER configured) ---\nTo: ${to}\n${body}\n---`);
  }
}
