import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyOtpSchema,
  type LoginInput,
  type RegisterInput,
} from '@needx/validation';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { toPrivateUser } from '../users/users.mapper';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './utils/cookie.util';
import { parseDurationToMs } from './utils/duration.util';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const secure = this.config.get<boolean>('jwt.cookieSecure');
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: parseDurationToMs(this.config.get<string>('jwt.accessTtl')!),
    });
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: parseDurationToMs(this.config.get<string>('jwt.refreshTtl')!),
    });
  }

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() dto: RegisterInput, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto);
    const tokens = this.authService.issueTokens({ id: user.id, email: user.email, roles: user.roles });
    this.setAuthCookies(res, tokens);
    return toPrivateUser(user);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Req() req: Request & { user: UserDocument }, @Res({ passthrough: true }) res: Response, @Body() _dto: LoginInput) {
    const user = req.user;
    const tokens = this.authService.issueTokens({ id: user.id, email: user.email, roles: user.roles });
    this.setAuthCookies(res, tokens);
    return toPrivateUser(user);
  }

  @Post('logout')
  @Public()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1/auth' });
    return { loggedOut: true };
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.refresh(userId);
    this.setAuthCookies(res, tokens);
    return { refreshed: true };
  }

  @Public()
  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() dto: { email: string }) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() dto: { token: string; password: string }) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password updated. You can now sign in.' };
  }

  @Public()
  @Post('verify-email')
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  async verifyEmail(@Body() dto: { token: string }) {
    await this.authService.verifyEmail(dto.token);
    return { message: 'Email verified.' };
  }

  @Public()
  @Post('otp/request')
  @UsePipes(new ZodValidationPipe(requestOtpSchema))
  async requestOtp(@Body() dto: { phone: string }) {
    await this.authService.requestOtp(dto.phone);
    return { message: 'Verification code sent.' };
  }

  @Public()
  @Post('otp/verify')
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(@Body() dto: { phone: string; code: string }) {
    await this.authService.verifyOtp(dto.phone, dto.code);
    return { message: 'Phone verified.' };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // Redirect handled by GoogleAuthGuard/passport.
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request & { user: { googleId: string; email: string; name: string; avatarUrl?: string } },
    @Res() res: Response,
  ) {
    const user = await this.authService.loginWithGoogle(req.user);
    const tokens = this.authService.issueTokens({ id: user.id, email: user.email, roles: user.roles });
    this.setAuthCookies(res, tokens);
    res.redirect(`${this.config.get<string>('app.appUrl')}/dashboard`);
  }
}
