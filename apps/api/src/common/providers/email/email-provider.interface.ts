export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Abstraction so the rest of the app never talks to SMTP/SES/etc directly.
 * Swap the binding in providers.module.ts once real SMTP_* env vars exist —
 * nothing else in the codebase needs to change.
 */
export interface EmailProvider {
  send(input: SendEmailInput): Promise<void>;
}
