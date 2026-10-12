import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';

/**
 * Registered even without real Google credentials so the module graph
 * always boots — routes that use it will simply fail clearly at request
 * time until GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are set. Per project
 * rules, no OAuth secret is ever invented; see ENVIRONMENT.md.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleStrategy');
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const clientID = config.get<string>('google.clientId');
    const clientSecret = config.get<string>('google.clientSecret');
    const callbackURL =
      config.get<string>('google.callbackUrl') ?? 'http://localhost:4000/api/v1/auth/google/callback';

    super({
      clientID: clientID || 'unconfigured-client-id',
      clientSecret: clientSecret || 'unconfigured-client-secret',
      callbackURL,
      scope: ['email', 'profile'],
    });

    this.configured = Boolean(clientID && clientSecret);
    if (!this.configured) {
      this.logger.warn(
        'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — /auth/google will 501 until configured.',
      );
    }
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    if (!this.configured) {
      return done(new Error('Google login is not configured on this server'), undefined);
    }
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('Google account has no email'), undefined);
    done(null, {
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    });
  }
}
