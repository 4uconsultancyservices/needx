/* eslint-disable no-console */
import 'reflect-metadata';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';

import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { CustomerProfile, CustomerProfileSchema } from '../modules/users/schemas/customer-profile.schema';
import { Employee, EmployeeSchema } from '../modules/staff/schemas/employee.schema';
import { StaffProfile, StaffProfileSchema } from '../modules/staff/schemas/staff-profile.schema';
import { Category, CategorySchema } from '../modules/categories/schemas/category.schema';
import { Need, NeedSchema } from '../modules/needs/schemas/need.schema';
import { Listing, ListingSchema } from '../modules/listings/schemas/listing.schema';
import { Offer, OfferSchema } from '../modules/offers/schemas/offer.schema';
import { OfferHistory, OfferHistorySchema } from '../modules/offers/schemas/offer-history.schema';
import { Order, OrderSchema } from '../modules/orders/schemas/order.schema';
import { Review, ReviewSchema } from '../modules/reviews/schemas/review.schema';

import {
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_LISTINGS,
  SEED_NEEDS,
  SEED_STAFF,
  SEED_USERS,
} from './seed-data';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/needx';
const SEED_PASSWORD = 'Needx@12345';
const RESET = process.argv.includes('--reset');

function cityPoint(cityName: string) {
  const city = SEED_CITIES.find((c) => c.name === cityName);
  if (!city) throw new Error(`Unknown seed city: ${cityName}`);
  return { point: { type: 'Point' as const, coordinates: [city.lng, city.lat] as [number, number] }, label: `${cityName}, ${city.state}`, city: cityName, state: city.state };
}

async function main() {
  console.log(`Connecting to ${MONGODB_URI} ...`);
  await mongoose.connect(MONGODB_URI);

  const UserModel = mongoose.model(User.name, UserSchema); // collection: 'customers'
  const EmployeeModel = mongoose.model(Employee.name, EmployeeSchema); // collection: 'employees'
  const CustomerProfileModel = mongoose.model(CustomerProfile.name, CustomerProfileSchema);
  const StaffProfileModel = mongoose.model(StaffProfile.name, StaffProfileSchema);
  const CategoryModel = mongoose.model(Category.name, CategorySchema);
  const NeedModel = mongoose.model(Need.name, NeedSchema);
  const ListingModel = mongoose.model(Listing.name, ListingSchema);
  const OfferModel = mongoose.model(Offer.name, OfferSchema);
  const OfferHistoryModel = mongoose.model(OfferHistory.name, OfferHistorySchema);
  const OrderModel = mongoose.model(Order.name, OrderSchema);
  const ReviewModel = mongoose.model(Review.name, ReviewSchema);

  if (RESET) {
    console.log('Resetting collections (customers, employees, etc.)...');
    const models = [
      UserModel,
      EmployeeModel,
      CustomerProfileModel,
      StaffProfileModel,
      CategoryModel,
      NeedModel,
      ListingModel,
      OfferModel,
      OfferHistoryModel,
      OrderModel,
      ReviewModel,
    ];
    for (const m of models) {
      await (m as mongoose.Model<unknown>).deleteMany({});
    }
    // Also drop legacy collections if they exist
    try { await mongoose.connection.collection('users').drop(); } catch (_) {}
    try { await mongoose.connection.collection('staff_profiles').drop(); } catch (_) {}
  }

  // ---- Categories ----
  console.log('Seeding categories...');
  const categoryBySlug = new Map<string, any>();
  for (const c of SEED_CATEGORIES) {
    const doc = await CategoryModel.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, icon: c.icon, keywords: [...c.keywords], attributes: c.attributes, isActive: true } },
      { upsert: true, new: true },
    );
    categoryBySlug.set(c.slug, doc);
  }

  // ---- Users ----
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const userByEmail = new Map<string, any>();
  for (const u of SEED_USERS) {
    const loc = cityPoint(u.city);
    const isProvider = 'provider' in u && Boolean(u.provider);
    const trust = isProvider
      ? {
          phoneVerified: true,
          emailVerified: true,
          identityVerified: Math.random() > 0.3,
          businessVerified: u.provider === 'BUSINESS',
          completedTransactions: Math.floor(Math.random() * 40) + 5,
          ratingAverage: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
          ratingCount: Math.floor(Math.random() * 30) + 3,
          cancellationRate: Math.round(Math.random() * 10) / 100,
          responseRate: Math.round((0.85 + Math.random() * 0.15) * 100) / 100,
        }
      : { phoneVerified: true, emailVerified: true };

    const roles = ['USER'];
    if ('role' in u && u.role) roles.push(u.role as string);
    if (isProvider) {
      roles.push('PROVIDER');
      if (u.provider === 'BUSINESS') roles.push('BUSINESS');
    }

    const doc = await UserModel.findOneAndUpdate(
      { email: u.email },
      {
        $set: {
          name: u.name,
          email: u.email,
          passwordHash,
          city: u.city,
          roles,
          approxLocation: loc.point,
          trust,
          ...(isProvider
            ? {
                provider: {
                  isProvider: true,
                  providerType: u.provider,
                  businessName: 'business' in u ? u.business : undefined,
                  description: `Trusted ${String(u.provider).toLowerCase()} provider on NEEDX, based in ${u.city}.`,
                  serviceCategories: [],
                },
              }
            : {}),
        },
      },
      { upsert: true, new: true },
    );
    userByEmail.set(u.email, doc);
  }

  // ---- Employees (Dedicated 'employees' collection) ----
  console.log('Seeding employees into dedicated employees database collection...');
  for (const s of SEED_STAFF) {
    const roles = ['STAFF', s.role];
    if (s.role === 'SUPER_ADMIN') roles.push('ADMIN');

    const empDoc = await EmployeeModel.findOneAndUpdate(
      { email: s.email },
      {
        $set: {
          name: s.name,
          email: s.email,
          passwordHash,
          phone: 'phone' in s ? (s as any).phone : undefined,
          city: s.city,
          department: s.department,
          designation: s.designation,
          role: s.role,
          roles,
          permissions: [...s.permissions],
          assignedQueues: [...s.queues],
          isSuspended: false,
          lastActiveAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    userByEmail.set(s.email, empDoc);
  }

  // Ensure admin@needx.local is seeded in dedicated employees collection
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const adminEmp = await EmployeeModel.findOneAndUpdate(
    { email: 'admin@needx.local' },
    {
      $set: {
        name: 'Super Administrator',
        email: 'admin@needx.local',
        passwordHash: adminPasswordHash,
        phone: '+919999000000',
        city: 'Delhi',
        department: 'EXECUTIVE',
        designation: 'Principal Systems Administrator',
        role: 'SUPER_ADMIN',
        roles: ['STAFF', 'ADMIN', 'SUPER_ADMIN'],
        permissions: ['*'],
        assignedQueues: ['master-admin', 'support', 'disputes', 'finance'],
        isSuspended: false,
        lastActiveAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );
  userByEmail.set('admin@needx.local', adminEmp);

  // ---- Customer Profiles ----
  console.log('Seeding customer profiles with buyer metrics, KYC, & loyalty tiers...');
  const customerProfilesData: Record<string, any> = {
    'ananya@needx.local': {
      buyerMetrics: {
        totalNeedsPosted: 6,
        totalOrdersPlaced: 5,
        totalAmountSpent: 42500,
        activeNeedsCount: 2,
        averageOrderValue: 8500,
        fulfillmentRate: 0.95,
      },
      loyalty: {
        tier: 'PLATINUM',
        points: 1250,
        lifetimePoints: 2400,
      },
      kyc: {
        status: 'VERIFIED',
        documentType: 'PASSPORT',
        idNumberMasked: 'Z****1842',
        verifiedAt: new Date(),
      },
      customerTags: ['VIP', 'HIGH_VALUE', 'EARLY_ADOPTER', 'DELHI_HUB'],
      internalNotes:
        'High-volume electronics and equipment seeker. Extremely reliable payer with 100% dispute-free record. Priority support tier.',
      preferences: {
        preferredCategories: ['electronics', 'photography'],
        preferredModes: ['RENT', 'BUY'],
        searchRadiusKm: 30,
        currency: 'INR',
        budgetTier: 'PREMIUM',
        notifications: { email: true, sms: true, push: true, whatsapp: true },
      },
    },
    'rohan@needx.local': {
      buyerMetrics: {
        totalNeedsPosted: 3,
        totalOrdersPlaced: 2,
        totalAmountSpent: 18200,
        activeNeedsCount: 1,
        averageOrderValue: 9100,
        fulfillmentRate: 0.88,
      },
      loyalty: {
        tier: 'GOLD',
        points: 620,
        lifetimePoints: 950,
      },
      kyc: {
        status: 'VERIFIED',
        documentType: 'AADHAAR',
        idNumberMasked: 'XXXXXXXX7821',
        verifiedAt: new Date(),
      },
      customerTags: ['FREQUENT_BUYER', 'EQUIPMENT_RENTER'],
      internalNotes:
        'Regular tools and machinery renter. Verified business premises in Gurgaon.',
      preferences: {
        preferredCategories: ['tools-equipment', 'vehicles'],
        preferredModes: ['RENT', 'BORROW'],
        searchRadiusKm: 25,
        currency: 'INR',
        budgetTier: 'STANDARD',
        notifications: { email: true, sms: false, push: true, whatsapp: true },
      },
    },
    'sneha@needx.local': {
      buyerMetrics: {
        totalNeedsPosted: 2,
        totalOrdersPlaced: 1,
        totalAmountSpent: 6500,
        activeNeedsCount: 1,
        averageOrderValue: 6500,
        fulfillmentRate: 0.75,
      },
      loyalty: {
        tier: 'SILVER',
        points: 180,
        lifetimePoints: 240,
      },
      kyc: {
        status: 'PENDING',
        documentType: 'DRIVING_LICENSE',
        idNumberMasked: 'TS****9021',
      },
      customerTags: ['NEW_SEEKER', 'EVENT_PLANNER'],
      internalNotes:
        'Event management coordinator. Submitted driving license for KYC verification pending operator review.',
      preferences: {
        preferredCategories: ['event-equipment', 'photography'],
        preferredModes: ['HIRE', 'RENT'],
        searchRadiusKm: 40,
        currency: 'INR',
        budgetTier: 'STANDARD',
        notifications: { email: true, sms: true, push: false, whatsapp: false },
      },
    },
    'vikram@needx.local': {
      buyerMetrics: {
        totalNeedsPosted: 1,
        totalOrdersPlaced: 0,
        totalAmountSpent: 0,
        activeNeedsCount: 1,
        averageOrderValue: 0,
        fulfillmentRate: 0.5,
      },
      loyalty: {
        tier: 'BRONZE',
        points: 50,
        lifetimePoints: 50,
      },
      kyc: {
        status: 'REJECTED',
        documentType: 'PAN',
        idNumberMasked: 'ABC****12F',
        rejectionReason: 'Document image was blurry and name mismatched with PAN database.',
      },
      customerTags: ['KYC_REVIEW_REQUIRED'],
      internalNotes:
        'KYC rejected due to unreadable document photocopy. Requested re-upload via SMS notification.',
      preferences: {
        preferredCategories: ['home-services'],
        preferredModes: ['HIRE'],
        searchRadiusKm: 20,
        currency: 'INR',
        budgetTier: 'ECONOMY',
        notifications: { email: true, sms: true, push: false, whatsapp: false },
      },
    },
    'ishita@needx.local': {
      buyerMetrics: {
        totalNeedsPosted: 4,
        totalOrdersPlaced: 3,
        totalAmountSpent: 28900,
        activeNeedsCount: 1,
        averageOrderValue: 9633,
        fulfillmentRate: 1.0,
      },
      loyalty: {
        tier: 'GOLD',
        points: 780,
        lifetimePoints: 1100,
      },
      kyc: {
        status: 'VERIFIED',
        documentType: 'AADHAAR',
        idNumberMasked: 'XXXXXXXX4390',
        verifiedAt: new Date(),
      },
      customerTags: ['VIP', 'CORPORATE_PROCUREMENT'],
      internalNotes:
        'Corporate client for office furniture and electronics. Direct billing setup active.',
      preferences: {
        preferredCategories: ['furniture', 'business-equipment'],
        preferredModes: ['BUY', 'RENT'],
        searchRadiusKm: 50,
        currency: 'INR',
        budgetTier: 'PREMIUM',
        notifications: { email: true, sms: true, push: true, whatsapp: true },
      },
    },
    'aditya@needx.local': {
      buyerMetrics: {
        totalNeedsPosted: 1,
        totalOrdersPlaced: 1,
        totalAmountSpent: 4500,
        activeNeedsCount: 0,
        averageOrderValue: 4500,
        fulfillmentRate: 1.0,
      },
      loyalty: {
        tier: 'BRONZE',
        points: 90,
        lifetimePoints: 90,
      },
      kyc: {
        status: 'NOT_SUBMITTED',
      },
      customerTags: ['COMMUNITY_SEEKER'],
      internalNotes: 'New platform member from Bangalore.',
      preferences: {
        preferredCategories: ['education', 'sports'],
        preferredModes: ['BUY', 'BORROW'],
        searchRadiusKm: 15,
        currency: 'INR',
        budgetTier: 'STANDARD',
        notifications: { email: true, sms: false, push: true, whatsapp: false },
      },
    },
  };

  for (const [email, cData] of Object.entries(customerProfilesData)) {
    const userDoc = userByEmail.get(email);
    if (userDoc) {
      await UserModel.updateOne(
        { _id: userDoc._id },
        {
          $set: {
            buyerMetrics: cData.buyerMetrics,
            loyalty: cData.loyalty,
            kyc: cData.kyc,
            customerTags: cData.customerTags,
            internalNotes: cData.internalNotes,
            preferences: cData.preferences,
          },
        },
      );

      await CustomerProfileModel.findOneAndUpdate(
        { userId: userDoc._id },
        {
          $set: {
            userId: userDoc._id,
            buyerMetrics: cData.buyerMetrics,
            loyalty: cData.loyalty,
            kyc: cData.kyc,
            customerTags: cData.customerTags,
            internalNotes: cData.internalNotes,
            preferences: cData.preferences,
          },
        },
        { upsert: true, new: true },
      );
    }
  }

  // ---- Listings ----
  console.log('Seeding listings...');
  const listingDocs: any[] = [];
  for (const l of SEED_LISTINGS) {
    const provider = userByEmail.get(l.providerEmail);
    const category = categoryBySlug.get(l.category);
    const loc = cityPoint(l.city);
    const doc = await ListingModel.findOneAndUpdate(
      { providerId: provider._id, title: l.title },
      {
        $set: {
          providerId: provider._id,
          categoryId: category._id,
          title: l.title,
          description: l.description,
          type: l.type,
          modes: [...l.modes],
          price: { amount: l.price, currency: 'INR', unit: l.unit },
          deposit: 'deposit' in l ? l.deposit : undefined,
          quantity: 1,
          condition: l.condition,
          images: [],
          location: loc,
          status: 'ACTIVE',
        },
      },
      { upsert: true, new: true },
    );
    listingDocs.push(doc);
  }

  // ---- Needs ----
  console.log('Seeding needs...');
  const needDocs: any[] = [];
  for (const n of SEED_NEEDS) {
    const user = userByEmail.get(n.userEmail);
    const category = categoryBySlug.get(n.category);
    const loc = cityPoint(n.city);
    const doc = await NeedModel.findOneAndUpdate(
      { userId: user._id, title: n.title },
      {
        $set: {
          userId: user._id,
          title: n.title,
          description: n.text,
          categoryId: category._id,
          modes: [...n.modes],
          budget: { max: n.budgetMax, currency: 'INR' },
          quantity: 1,
          dateRange: { start: new Date(), end: addDays(new Date(), 2) },
          location: loc,
          attributes: {},
          status: 'ACTIVE',
          rawInput: n.text,
          parseSource: 'RULE_BASED',
        },
      },
      { upsert: true, new: true },
    );
    needDocs.push(doc);
  }

  // ---- A couple of offers (SENT + one full ACCEPTED -> ORDER -> COMPLETED -> REVIEW cycle) ----
  console.log('Seeding a sample offer + completed order + review...');
  const projectorNeed = needDocs[0]; // Ananya's projector need
  const projectorListing = listingDocs.find((l) => l.title.includes('BenQ'));
  const provider = userByEmail.get('aarav.provider@needx.local');

  if (projectorNeed && projectorListing) {
    let offer = await OfferModel.findOne({ needId: projectorNeed._id, providerId: provider._id });
    if (!offer) {
      offer = await OfferModel.create({
        needId: projectorNeed._id,
        providerId: provider._id,
        listingId: projectorListing._id,
        mode: 'RENT',
        price: 850,
        deposit: 2500,
        currency: 'INR',
        message: 'Available this weekend, includes HDMI cable and remote.',
        status: 'ACCEPTED',
        expiresAt: addDays(new Date(), 3),
      });
      await OfferHistoryModel.create([
        { offerId: offer._id, actorId: provider._id, action: 'SENT', price: 850, message: 'Available this weekend.' },
        { offerId: offer._id, actorId: projectorNeed.userId, action: 'ACCEPTED' },
      ]);
    }

    let order = await OrderModel.findOne({ offerId: offer._id });
    if (!order) {
      order = await OrderModel.create({
        needId: projectorNeed._id,
        offerId: offer._id,
        listingId: projectorListing._id,
        buyerId: projectorNeed.userId,
        providerId: provider._id,
        type: 'RENT',
        status: 'COMPLETED',
        amount: 850,
        depositAmount: 2500,
        currency: 'INR',
        quantity: 1,
        statusHistory: [
          { status: 'PENDING', at: new Date(), actorId: projectorNeed.userId },
          { status: 'PAYMENT_PENDING', at: new Date() },
          { status: 'PAID', at: new Date() },
          { status: 'CONFIRMED', at: new Date(), actorId: provider._id },
          { status: 'READY', at: new Date(), actorId: provider._id },
          { status: 'ACTIVE', at: new Date() },
          { status: 'COMPLETED', at: new Date() },
        ],
      });
    }

    const existingReview = await ReviewModel.findOne({ orderId: order._id, reviewerId: projectorNeed.userId });
    if (!existingReview) {
      await ReviewModel.create({
        orderId: order._id,
        reviewerId: projectorNeed.userId,
        revieweeId: provider._id,
        ratings: { overall: 5, communication: 5, quality: 5, timeliness: 4 },
        comment: 'Projector was in great condition and Aarav was super responsive. Would rent again!',
      });
    }
  }

  console.log('\nSeed complete.');
  console.log(`\nDev login for ANY seeded account: password "${SEED_PASSWORD}"`);
  console.log('  Master Admin: superadmin@needx.local (Executive / Master Wildcard)');
  console.log('  Admin:        admin@needx.local (Systems Administrator)');
  console.log('  Staff:        support.deepak@needx.local (Customer Support)');
  console.log('  Staff:        moderator.meera@needx.local (Trust & Safety Arbitrator)');
  console.log('  Staff:        finance.rahul@needx.local (Finance & Escrow Controller)');
  console.log('  Staff:        catalog.kavita@needx.local (Catalog Taxonomy Lead)');
  console.log('  Staff:        ops.arjun@needx.local (Operations Lead)');
  console.log('  Provider:     aarav.provider@needx.local (Electronics rentals, Gurgaon)');
  console.log('  Provider:     priya.provider@needx.local (Photography services, Bangalore)');
  console.log('  Seeker (VIP): ananya@needx.local (Platinum Loyalty, Verified KYC)');
  console.log('  Seeker:       rohan@needx.local (Gold Loyalty, Verified KYC)');
  console.log('  Seeker:       sneha@needx.local (Silver Loyalty, Pending KYC)');
  console.log('  Seeker:       vikram@needx.local (Bronze Loyalty, Rejected KYC)');
  console.log(`\n${categoryBySlug.size} categories, ${userByEmail.size} users (${SEED_STAFF.length + 1} staff profiles), ${listingDocs.length} listings, ${needDocs.length} needs seeded.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
