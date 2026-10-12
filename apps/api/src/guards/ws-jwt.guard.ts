import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Socket } from 'socket.io';
import { extractAccessTokenFromCookieHeader } from '../modules/auth/utils/cookie.util';
import type { AuthenticatedUser } from '../modules/auth/types/authenticated-user';

/** Authenticates a Socket.IO connection using the same access-token cookie as HTTP. */
@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger('WsJwtGuard');

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        extractAccessTokenFromCookieHeader(client.handshake.headers.cookie);
      if (!token) throw new UnauthorizedException('Missing auth token');

      const payload = this.jwtService.verify<AuthenticatedUser & { sub: string }>(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      (client.data as { user?: AuthenticatedUser }).user = { ...payload, id: payload.sub };
      return true;
    } catch (err) {
      this.logger.warn(`Socket auth rejected: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
