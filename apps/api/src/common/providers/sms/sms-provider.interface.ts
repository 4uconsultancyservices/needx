export const SMS_PROVIDER = 'SMS_PROVIDER';

export interface SmsProvider {
  send(to: string, body: string): Promise<void>;
}
