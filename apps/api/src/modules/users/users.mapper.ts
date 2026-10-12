import type { PublicUser, User as UserWire } from '@needx/types';
import type { UserDocument } from './schemas/user.schema';

/** Safe to show to anyone — no email, phone, or precise location. */
export function toPublicUser(doc: UserDocument): PublicUser {
  const json = doc.toJSON() as unknown as Record<string, any>;
  return {
    id: json.id,
    name: json.name,
    avatarUrl: json.avatarUrl,
    bio: json.bio,
    city: json.city,
    roles: json.roles,
    provider: json.provider,
    trust: json.trust,
    isBanned: Boolean(json.isBanned),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

/** Only ever returned to the user themselves (e.g. GET /users/me). */
export function toPrivateUser(doc: UserDocument): UserWire {
  const json = doc.toJSON() as unknown as Record<string, any>;
  return {
    ...toPublicUser(doc),
    email: json.email,
    phone: json.phone,
    approxLocation: json.approxLocation,
  };
}

/** Returned for Admin CRM operators — includes contact info and suspension state. */
export function toAdminUserWire(doc: UserDocument) {
  const json = doc.toJSON() as unknown as Record<string, any>;
  return {
    ...toPublicUser(doc),
    email: json.email,
    phone: json.phone,
    isBanned: Boolean(json.isBanned),
    bannedReason: json.bannedReason,
  };
}

