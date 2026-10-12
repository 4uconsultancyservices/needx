import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_COOKIE } from '../utils/cookie.util';

interface RefreshTokenPayload {
  sub: string;
  email: string;
}

const fromRefreshCookie = (req: Request): string | null =>
  (req.cookies as Record<string, string> | undefined)?.[REFRESH_TOKEN_COOKIE] ?? null;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('jwt.refreshSecret');
    if (!secret) throw new Error('jwt.refreshSecret is not configured');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromRefreshCookie]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: false,
    });
  }

  validate(payload: RefreshTokenPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
