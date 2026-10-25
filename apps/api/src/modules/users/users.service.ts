import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { BecomeProviderInput, CreateAddressInput, UpdateProfileInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { User, UserDocument } from './schemas/user.schema';
import { Address, AddressDocument } from './schemas/address.schema';
import { Employee } from '../staff/schemas/employee.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Address.name) private readonly addressModel: Model<Address>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
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
    if (user) return user;

    // Check dedicated employees collection
    const employee = await this.employeeModel.findById(id).exec();
    if (employee) {
      return {
        id: employee._id.toString(),
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        avatarUrl: employee.avatarUrl,
        roles: employee.roles || ['STAFF', employee.role],
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
          roles: employee.roles || ['STAFF', employee.role],
          department: employee.department,
          designation: employee.designation,
          permissions: employee.permissions,
          isBanned: employee.isSuspended,
        }),
      } as unknown as UserDocument;
    }

    throw AppException.notFound('User');
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
    const filter: Record<string, any> = {
      roles: { $nin: ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'] },
    };
    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
        { phone: { $regex: q.trim(), $options: 'i' } },
      ];
    }
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

  async listPublicProviders(params: {
    page: number;
    limit: number;
    q?: string;
    city?: string;
    category?: string;
    minRating?: number;
    verifiedOnly?: boolean;
    sort?: 'rating' | 'newest' | 'transactions';
  }) {
    const filter: Record<string, any> = {
      isBanned: false,
      $or: [
        { 'provider.isProvider': true },
        { roles: { $in: ['PROVIDER', 'BUSINESS'] } },
      ],
    };

    if (params.city && params.city.trim()) {
      filter.city = { $regex: new RegExp(`^${params.city.trim()}$`, 'i') };
    }

    if (params.category && params.category.trim()) {
      filter['provider.serviceCategories'] = {
        $elemMatch: { $regex: new RegExp(params.category.trim(), 'i') },
      };
    }

    if (params.minRating && params.minRating > 0) {
      filter['trust.ratingAverage'] = { $gte: params.minRating };
    }

    if (params.verifiedOnly) {
      filter['$and'] = filter['$and'] || [];
      filter['$and'].push({
        $or: [
          { 'trust.identityVerified': true },
          { 'trust.businessVerified': true },
        ],
      });
    }

    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      filter['$and'] = filter['$and'] || [];
      filter['$and'].push({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { 'provider.businessName': { $regex: q, $options: 'i' } },
          { 'provider.description': { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } },
          { 'provider.serviceCategories': { $regex: q, $options: 'i' } },
        ],
      });
    }

    let sortOption: Record<string, 1 | -1> = { 'trust.ratingAverage': -1, 'trust.ratingCount': -1 };
    if (params.sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (params.sort === 'transactions') {
      sortOption = { 'trust.completedTransactions': -1 };
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sortOption)
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }
}
