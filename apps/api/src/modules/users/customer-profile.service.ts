import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type {
  AdminUpdateCustomerProfileInput,
  UpdateCustomerPreferencesInput,
} from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { CustomerProfile, type CustomerProfileDocument } from './schemas/customer-profile.schema';

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectModel(CustomerProfile.name)
    private readonly profileModel: Model<CustomerProfile>,
  ) {}

  async getOrCreateForUser(userId: string): Promise<CustomerProfileDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw AppException.badRequest('Invalid user id');
    }

    let profile = await this.profileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!profile) {
      profile = await this.profileModel.create({
        userId: new Types.ObjectId(userId),
        preferences: {
          preferredCategories: [],
          preferredModes: ['BUY', 'RENT'],
          searchRadiusKm: 25,
          currency: 'INR',
          budgetTier: 'STANDARD',
          notifications: {
            email: true,
            sms: true,
            push: true,
            whatsapp: false,
          },
        },
        buyerMetrics: {
          totalNeedsPosted: 0,
          totalOrdersPlaced: 0,
          totalAmountSpent: 0,
          activeNeedsCount: 0,
          averageOrderValue: 0,
          fulfillmentRate: 1,
        },
        kyc: {
          status: 'NOT_SUBMITTED',
        },
        loyalty: {
          tier: 'BRONZE',
          points: 50,
          lifetimePoints: 50,
        },
        customerTags: ['NEW_BUYER'],
      });
    }

    return profile;
  }

  async updatePreferences(
    userId: string,
    input: UpdateCustomerPreferencesInput,
  ): Promise<CustomerProfileDocument> {
    const profile = await this.getOrCreateForUser(userId);

    if (input.preferredCategories) {
      profile.preferences.preferredCategories = input.preferredCategories;
    }
    if (input.preferredModes) {
      profile.preferences.preferredModes = input.preferredModes;
    }
    if (input.searchRadiusKm) {
      profile.preferences.searchRadiusKm = input.searchRadiusKm;
    }
    if (input.currency) {
      profile.preferences.currency = input.currency;
    }
    if (input.budgetTier) {
      profile.preferences.budgetTier = input.budgetTier;
    }
    if (input.notifications) {
      Object.assign(profile.preferences.notifications, input.notifications);
    }

    profile.markModified('preferences');
    await profile.save();
    return profile;
  }

  async recordNeedCreated(userId: string): Promise<void> {
    await this.profileModel.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $inc: {
          'buyerMetrics.totalNeedsPosted': 1,
          'buyerMetrics.activeNeedsCount': 1,
          'loyalty.points': 10,
          'loyalty.lifetimePoints': 10,
        },
      },
      { upsert: true },
    ).exec();
  }

  async recordOrderCompleted(userId: string, amount: number): Promise<void> {
    const profile = await this.getOrCreateForUser(userId);
    profile.buyerMetrics.totalOrdersPlaced += 1;
    profile.buyerMetrics.totalAmountSpent += amount;
    profile.buyerMetrics.averageOrderValue = Math.round(
      profile.buyerMetrics.totalAmountSpent / profile.buyerMetrics.totalOrdersPlaced,
    );
    profile.loyalty.points += Math.floor(amount / 100);
    profile.loyalty.lifetimePoints += Math.floor(amount / 100);

    // Update tier automatically based on lifetime spend
    if (profile.buyerMetrics.totalAmountSpent >= 100000) {
      profile.loyalty.tier = 'PLATINUM';
    } else if (profile.buyerMetrics.totalAmountSpent >= 50000) {
      profile.loyalty.tier = 'GOLD';
    } else if (profile.buyerMetrics.totalAmountSpent >= 15000) {
      profile.loyalty.tier = 'SILVER';
    }

    profile.markModified('buyerMetrics');
    profile.markModified('loyalty');
    await profile.save();
  }

  async adminUpdate(
    userId: string,
    input: AdminUpdateCustomerProfileInput,
  ): Promise<CustomerProfileDocument> {
    const profile = await this.getOrCreateForUser(userId);

    if (input.customerTags) {
      profile.customerTags = input.customerTags;
    }
    if (input.internalNotes !== undefined) {
      profile.internalNotes = input.internalNotes;
    }
    if (input.kycStatus) {
      profile.kyc.status = input.kycStatus;
      if (input.kycStatus === 'VERIFIED') {
        profile.kyc.verifiedAt = new Date();
        profile.kyc.rejectionReason = undefined;
      } else if (input.kycStatus === 'REJECTED') {
        profile.kyc.rejectionReason = input.kycRejectionReason;
      }
    }
    if (input.loyaltyPointsDelta) {
      profile.loyalty.points = Math.max(0, profile.loyalty.points + input.loyaltyPointsDelta);
      if (input.loyaltyPointsDelta > 0) {
        profile.loyalty.lifetimePoints += input.loyaltyPointsDelta;
      }
    }

    profile.markModified('kyc');
    profile.markModified('loyalty');
    await profile.save();
    return profile;
  }
}
