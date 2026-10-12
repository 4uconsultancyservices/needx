import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@needx/types';
import { parseDurationToMs } from './utils/duration.util';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  issueTokenPair(user: { id: string; email: string; roles: Role[] }): TokenPair {
    const accessTtl = this.config.get<string>('jwt.accessTtl') ?? '15m';
    const refreshTtl = this.config.get<string>('jwt.refreshTtl') ?? '7d';

    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, roles: user.roles },
      {
        secret: this.config.get<string>('jwt.secret'),
        // Passed in seconds (a plain number) rather than a duration string —
        // sidesteps @nestjs/jwt's branded `StringValue` typing entirely and
        // is exactly what the underlying `jsonwebtoken` lib expects for `exp`.
        expiresIn: Math.floor(parseDurationToMs(accessTtl) / 1000),
      },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: Math.floor(parseDurationToMs(refreshTtl) / 1000),
      },
    );
    return { accessToken, refreshToken };
  }
}
