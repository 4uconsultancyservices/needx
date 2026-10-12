import { Injectable, Logger } from '@nestjs/common';
import type { EmailProvider, SendEmailInput } from './email-provider.interface';

/**
 * Dev-mode default: "sends" email by logging it. No SMTP credentials exist
 * in this environment (and none are invented — see ENVIRONMENT.md), so this
 * is what NEEDX falls back to, matching the spec's "fail gracefully, never
 * fake success" rule while keeping every auth flow fully exercisable locally.
 */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly logger = new Logger('EmailProvider(console)');

  async send(input: SendEmailInput): Promise<void> {
    this.logger.log(
      `\n--- EMAIL (dev fallback, no SMTP_HOST configured) ---\n` +
        `To: ${input.to}\nSubject: ${input.subject}\n\n${input.text ?? stripHtml(input.html)}\n` +
        `------------------------------------------------------`,
    );
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
