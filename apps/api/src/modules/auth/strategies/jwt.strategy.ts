import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Role } from '@needx/types';
import { ACCESS_TOKEN_COOKIE } from '../utils/cookie.util';
import type { AuthenticatedUser } from '../types/authenticated-user';

interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: Role[];
}

const fromCookieOrHeader = (req: Request): string | null => {
  const fromCookie = (req.cookies as Record<string, string> | undefined)?.[ACCESS_TOKEN_COOKIE];
  if (fromCookie) return fromCookie;
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('jwt.secret');
    if (!secret) throw new Error('jwt.secret is not configured');
    super({
      jwtFromRequest: fromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
