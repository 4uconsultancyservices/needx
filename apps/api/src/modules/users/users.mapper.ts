import type { PublicUser, User as UserWire } from '@needx/types';
import type { UserDocument } from './schemas/user.schema';

/** Safe to show to anyone — no email, phone, or precise location. */
export function toPublicUser(doc: UserDocument | any): PublicUser {
  const json = typeof doc?.toJSON === 'function' ? (doc.toJSON() as Record<string, any>) : (doc as Record<string, any>);
  return {
    id: json.id || json._id?.toString(),
    name: json.name,
    avatarUrl: json.avatarUrl,
    bio: json.bio,
    city: json.city,
    roles: json.roles || [],
    provider: json.provider,
    trust: json.trust || { phoneVerified: true, emailVerified: true, identityVerified: true, businessVerified: false, completedTransactions: 0, ratingAverage: 0, ratingCount: 0, cancellationRate: 0, responseRate: 1 },
    isBanned: Boolean(json.isBanned),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

/** Only ever returned to the user themselves (e.g. GET /users/me). */
export function toPrivateUser(doc: UserDocument | any): UserWire {
  const json = typeof doc?.toJSON === 'function' ? (doc.toJSON() as Record<string, any>) : (doc as Record<string, any>);
  return {
    ...toPublicUser(doc),
    email: json.email,
    phone: json.phone,
    approxLocation: json.approxLocation,
  };
}

/** Returned for Admin CRM operators — includes contact info and suspension state. */
export function toAdminUserWire(doc: UserDocument | any) {
  const json = typeof doc?.toJSON === 'function' ? (doc.toJSON() as Record<string, any>) : (doc as Record<string, any>);
  return {
    ...toPublicUser(doc),
    email: json.email,
    phone: json.phone,
    isBanned: Boolean(json.isBanned),
    bannedReason: json.bannedReason,
  };
}

