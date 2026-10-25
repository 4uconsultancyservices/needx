import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { addMinutes, addHours, isAfter } from 'date-fns';
import type { Role } from '@needx/types';
import type { RegisterInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { EMAIL_PROVIDER, type EmailProvider } from '../../common/providers/email/email-provider.interface';
import { SMS_PROVIDER, type SmsProvider } from '../../common/providers/sms/sms-provider.interface';
import { UsersService } from '../users/users.service';
import { Employee } from '../staff/schemas/employee.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import { TokensService } from './tokens.service';
import type { UserDocument } from '../users/schemas/user.schema';

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly auditLog: AuditLogService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
  ) {}

  async register(dto: RegisterInput) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
    });

    const rawToken = randomBytes(32).toString('hex');
    user.emailVerificationTokenHash = sha256(rawToken);
    user.emailVerificationExpiresAt = addHours(new Date(), 24);
    await user.save();

    await this.emailProvider.send({
      to: user.email,
      subject: 'Verify your NEEDX account',
      html: `<p>Welcome to NEEDX! Verify your email using this code:</p><p><b>${rawToken}</b></p><p>This link expires in 24 hours.</p>`,
    });

    await this.auditLog.record({ actorId: user.id, action: 'USER_REGISTERED', targetType: 'User', targetId: user.id });

    return user;
  }

  async validateCredentials(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check dedicated employees collection first (for staff/admin accounts)
    const employee = await this.employeeModel
      .findOne({ email: normalizedEmail })
      .select('+passwordHash')
      .exec();

    if (employee) {
      if (employee.isSuspended) {
        throw new UnauthorizedException('This employee account has been suspended');
      }
      const valid = await bcrypt.compare(password, employee.passwordHash);
      if (!valid) throw new UnauthorizedException('Invalid email or password');

      const roles: Role[] = employee.roles?.length ? [...employee.roles] : ['STAFF', employee.role];
      if (employee.role === 'SUPER_ADMIN' && !roles.includes('ADMIN')) roles.push('ADMIN');

      return {
        id: employee._id.toString(),
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        avatarUrl: employee.avatarUrl,
        roles,
        department: employee.department,
        designation: employee.designation,
        permissions: employee.permissions,
        isSuspended: employee.isSuspended,
        isBanned: employee.isSuspended,
        toJSON: () => ({
          id: employee._id.toString(),
          _id: employee._id.toString(),
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          avatarUrl: employee.avatarUrl,
          roles,
          department: employee.department,
          designation: employee.designation,
          permissions: employee.permissions,
          isBanned: employee.isSuspended,
        }),
      } as unknown as UserDocument;
    }

    // 2. Check dedicated customers collection (for customer/buyer/provider accounts)
    const user = await this.usersService.findByEmailWithSecrets(normalizedEmail);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.isBanned) throw new UnauthorizedException('This account has been suspended');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  issueTokens(user: { id: string; email: string; roles: Role[] }) {
    return this.tokensService.issueTokenPair(user);
  }

  async refresh(userId: string) {
    if (Types.ObjectId.isValid(userId)) {
      const employee = await this.employeeModel.findById(userId).exec();
      if (employee) {
        if (employee.isSuspended) throw new UnauthorizedException('This employee account has been suspended');
        const roles: Role[] = employee.roles?.length ? [...employee.roles] : ['STAFF', employee.role];
        return this.issueTokens({ id: employee._id.toString(), email: employee.email, roles });
      }
    }

    const user = await this.usersService.findByIdOrThrow(userId);
    if (user.isBanned) throw new UnauthorizedException('This account has been suspended');
    return this.issueTokens({ id: user.id, email: user.email, roles: user.roles });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmailWithSecrets(email);
    // Always respond as if it worked — don't reveal whether the email exists.
    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');
    user.passwordResetTokenHash = sha256(rawToken);
    user.passwordResetExpiresAt = addMinutes(new Date(), 30);
    await user.save();

    await this.emailProvider.send({
      to: user.email,
      subject: 'Reset your NEEDX password',
      html: `<p>Use this code to reset your password (valid 30 minutes):</p><p><b>${rawToken}</b></p>`,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = sha256(token);
    const user = await this.usersService.findByResetToken(tokenHash);
    if (!user || !user.passwordResetExpiresAt || isAfter(new Date(), user.passwordResetExpiresAt)) {
      throw AppException.validation({ token: 'Invalid or expired reset link' });
    }
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersService.setPassword(user.id, passwordHash);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    await this.auditLog.record({ actorId: user.id, action: 'PASSWORD_CHANGED', targetType: 'User', targetId: user.id });
  }

  async verifyEmail(token: string) {
    const tokenHash = sha256(token);
    const user = await this.usersService.findByEmailVerificationToken(tokenHash);
    if (!user || !user.emailVerificationExpiresAt || isAfter(new Date(), user.emailVerificationExpiresAt)) {
      throw AppException.validation({ token: 'Invalid or expired verification link' });
    }
    await this.usersService.markEmailVerified(user.id);
  }

  async requestOtp(phone: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      // OTP can be requested pre-registration (e.g. phone-first sign-up flows);
      // we still need somewhere to park the code. Real deployments would use a
      // short-lived OTP collection instead of stapling it onto a phantom user —
      // documented as a follow-up in ARCHITECTURE.md.
      throw new AppException('PHONE_NOT_FOUND', 'No account with this phone number', HttpStatus.NOT_FOUND);
    }
    user.otpCodeHash = sha256(code);
    user.otpExpiresAt = addMinutes(new Date(), OTP_TTL_MINUTES);
    user.otpAttempts = 0;
    await user.save();

    await this.smsProvider.send(phone, `Your NEEDX verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`);
  }

  async verifyOtp(phone: string, code: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
      throw AppException.validation({ code: 'No verification in progress for this number' });
    }
    if ((user.otpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      throw AppException.validation({ code: 'Too many attempts — request a new code' });
    }
    if (isAfter(new Date(), user.otpExpiresAt)) {
      throw AppException.validation({ code: 'Code expired — request a new one' });
    }
    if (sha256(code) !== user.otpCodeHash) {
      user.otpAttempts = (user.otpAttempts ?? 0) + 1;
      await user.save();
      throw AppException.validation({ code: 'Incorrect code' });
    }
    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    await this.usersService.markPhoneVerified(user.id);
  }

  async loginWithGoogle(profile: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    const user = await this.usersService.findOrCreateGoogleUser(profile);
    if (user.isBanned) throw new UnauthorizedException('This account has been suspended');
    return user;
  }
}
