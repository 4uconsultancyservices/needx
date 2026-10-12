import { Module } from '@nestjs/common';
import { EMAIL_PROVIDER } from './email/email-provider.interface';
import { ConsoleEmailProvider } from './email/console-email.provider';
import { SMS_PROVIDER } from './sms/sms-provider.interface';
import { ConsoleSmsProvider } from './sms/console-sms.provider';

/**
 * Central place where every pluggable third-party integration is bound to
 * its dev-mode implementation. To go live: implement e.g. SesEmailProvider
 * and swap the `useClass` below — no other file changes.
 */
@Module({
  providers: [
    { provide: EMAIL_PROVIDER, useClass: ConsoleEmailProvider },
    { provide: SMS_PROVIDER, useClass: ConsoleSmsProvider },
  ],
  exports: [EMAIL_PROVIDER, SMS_PROVIDER],
})
export class ProvidersModule {}
