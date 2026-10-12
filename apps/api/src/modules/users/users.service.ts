import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { BecomeProviderInput, CreateAddressInput, UpdateProfileInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { User, UserDocument } from './schemas/user.schema';
import { Address, AddressDocument } from './schemas/address.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
  ) {}

  async findByEmailWithSecrets(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash +otpCodeHash +otpExpiresAt +otpAttempts')
      .exec();
  }

  async findByIdOrThrow(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) throw AppException.notFound('User');
    const user = await this.userModel.findById(id).exec();
    if (!user) throw AppException.notFound('User');
    return user;
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).select('+otpCodeHash +otpExpiresAt +otpAttempts').exec();
  }

  async findByResetToken(tokenHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ passwordResetTokenHash: tokenHash })
      .select('+passwordResetTokenHash +passwordResetExpiresAt')
      .exec();
  }

  async findByEmailVerificationToken(tokenHash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ emailVerificationTokenHash: tokenHash })
      .select('+emailVerificationTokenHash +emailVerificationExpiresAt')
      .exec();
  }

  async create(data: { name: string; email: string; passwordHash: string; phone?: string }) {
    const existing = await this.userModel.findOne({ email: data.email.toLowerCase() }).exec();
    if (existing) {
      throw AppException.conflict('An account with this email already exists', 'EMAIL_TAKEN');
    }
    return this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      phone: data.phone,
      roles: ['USER'],
    });
  }

  async findOrCreateGoogleUser(profile: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    let user = await this.userModel.findOne({ googleId: profile.googleId }).exec();
    if (user) return user;

    user = await this.userModel.findOne({ email: profile.email.toLowerCase() }).exec();
    if (user) {
      user.googleId = profile.googleId;
      await user.save();
      return user;
    }

    return this.userModel.create({
      name: profile.name,
      email: profile.email.toLowerCase(),
      // Google-authenticated accounts never set a local password.
      passwordHash: `google-oauth:${profile.googleId}`,
      avatarUrl: profile.avatarUrl,
      googleId: profile.googleId,
      roles: ['USER'],
      trust: { emailVerified: true },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileInput) {
    const user = await this.findByIdOrThrow(userId);
    Object.assign(user, dto);
    await user.save();
    return user;
  }

  async becomeProvider(userId: string, dto: BecomeProviderInput) {
    const user = await this.findByIdOrThrow(userId);
    user.provider = {
      isProvider: true,
      providerType: dto.providerType,
      businessName: dto.businessName,
      description: dto.description,
      serviceCategories: dto.serviceCategories ?? [],
    };
    if (!user.roles.includes('PROVIDER')) user.roles.push('PROVIDER');
    if (dto.providerType === 'BUSINESS' && !user.roles.includes('BUSINESS')) {
      user.roles.push('BUSINESS');
    }
    await user.save();
    return user;
  }

  async setPassword(userId: string, passwordHash: string) {
    await this.userModel.updateOne({ _id: userId }, { $set: { passwordHash } }).exec();
  }

  async markEmailVerified(userId: string) {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          $set: { 'trust.emailVerified': true },
          $unset: { emailVerificationTokenHash: '', emailVerificationExpiresAt: '' },
        },
      )
      .exec();
  }

  async markPhoneVerified(userId: string) {
    await this.userModel.updateOne({ _id: userId }, { $set: { 'trust.phoneVerified': true } }).exec();
  }

  /** Called by the reviews module after a review is created — keeps trust.rating* in sync. */
  async recomputeRating(userId: string, newAverage: number, newCount: number) {
    await this.userModel
      .updateOne(
        { _id: userId },
        { $set: { 'trust.ratingAverage': newAverage, 'trust.ratingCount': newCount } },
      )
      .exec();
  }

  async incrementCompletedTransactions(userId: string) {
    await this.userModel.updateOne({ _id: userId }, { $inc: { 'trust.completedTransactions': 1 } }).exec();
  }

  // ---- Addresses ----

  async listAddresses(userId: string): Promise<AddressDocument[]> {
    return this.addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
  }

  async createAddress(userId: string, dto: CreateAddressInput) {
    if (dto.isDefault) {
      await this.addressModel.updateMany({ userId }, { $set: { isDefault: false } }).exec();
    }
    return this.addressModel.create({ ...dto, userId });
  }

  async deleteAddress(userId: string, addressId: string) {
    const res = await this.addressModel.deleteOne({ _id: addressId, userId }).exec();
    if (res.deletedCount === 0) throw AppException.notFound('Address');
  }

  // ---- Admin ----

  async listForAdmin(page: number, limit: number, q?: string) {
    const filter = q ? { $text: { $search: q } } : {};
    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async setBanned(userId: string, banned: boolean, reason?: string) {
    const user = await this.findByIdOrThrow(userId);
    user.isBanned = banned;
    user.bannedReason = banned ? reason : undefined;
    await user.save();
    return user;
  }

  async setRoles(userId: string, roles: UserDocument['roles']) {
    const user = await this.findByIdOrThrow(userId);
    user.roles = roles;
    const isProv = roles.includes('PROVIDER') || roles.includes('BUSINESS');
    if (!user.provider) {
      user.provider = { isProvider: false, serviceCategories: [] } as any;
    }
    user.provider.isProvider = isProv;
    if (isProv && !user.provider.providerType) {
      user.provider.providerType = roles.includes('BUSINESS') ? 'BUSINESS' : 'INDIVIDUAL';
    }
    user.markModified('provider');
    user.markModified('roles');
    await user.save();
    return user;
  }

  async setProviderStatus(
    userId: string,
    isProvider: boolean,
    businessName?: string,
    providerType?: UserDocument['provider']['providerType'],
  ) {
    const user = await this.findByIdOrThrow(userId);
    if (!user.provider) {
      user.provider = { isProvider: false, serviceCategories: [] } as any;
    }
    user.provider.isProvider = isProvider;
    if (businessName) user.provider.businessName = businessName;
    if (providerType) user.provider.providerType = providerType;

    if (isProvider) {
      if (!user.roles.includes('PROVIDER')) user.roles.push('PROVIDER');
      if (providerType === 'BUSINESS' && !user.roles.includes('BUSINESS')) {
        user.roles.push('BUSINESS');
      }
    } else {
      user.roles = user.roles.filter((r) => r !== 'PROVIDER' && r !== 'BUSINESS');
      if (user.roles.length === 0) user.roles = ['USER'];
    }

    user.markModified('provider');
    user.markModified('roles');
    await user.save();
    return user;
  }
}
