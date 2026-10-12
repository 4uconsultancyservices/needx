/* eslint-disable no-console */
import 'reflect-metadata';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';

import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { Category, CategorySchema } from '../modules/categories/schemas/category.schema';
import { Need, NeedSchema } from '../modules/needs/schemas/need.schema';
import { Listing, ListingSchema } from '../modules/listings/schemas/listing.schema';
import { Offer, OfferSchema } from '../modules/offers/schemas/offer.schema';
import { OfferHistory, OfferHistorySchema } from '../modules/offers/schemas/offer-history.schema';
import { Order, OrderSchema } from '../modules/orders/schemas/order.schema';
import { Review, ReviewSchema } from '../modules/reviews/schemas/review.schema';

import { SEED_CATEGORIES, SEED_CITIES, SEED_LISTINGS, SEED_NEEDS, SEED_USERS } from './seed-data';

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

  const UserModel = mongoose.model(User.name, UserSchema);
  const CategoryModel = mongoose.model(Category.name, CategorySchema);
  const NeedModel = mongoose.model(Need.name, NeedSchema);
  const ListingModel = mongoose.model(Listing.name, ListingSchema);
  const OfferModel = mongoose.model(Offer.name, OfferSchema);
  const OfferHistoryModel = mongoose.model(OfferHistory.name, OfferHistorySchema);
  const OrderModel = mongoose.model(Order.name, OrderSchema);
  const ReviewModel = mongoose.model(Review.name, ReviewSchema);

  if (RESET) {
    console.log('Resetting collections...');
    const models = [UserModel, CategoryModel, NeedModel, ListingModel, OfferModel, OfferHistoryModel, OrderModel, ReviewModel];
    for (const m of models) {
      await (m as mongoose.Model<unknown>).deleteMany({});
    }
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
  console.log('  Admin:        admin@needx.local');
  console.log('  Provider:     aarav.provider@needx.local (Electronics rentals, Gurgaon)');
  console.log('  Provider:     priya.provider@needx.local (Photography services, Bangalore)');
  console.log('  Regular user: ananya@needx.local (Delhi)');
  console.log(`\n${categoryBySlug.size} categories, ${userByEmail.size} users, ${listingDocs.length} listings, ${needDocs.length} needs seeded.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
