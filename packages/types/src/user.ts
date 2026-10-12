import type { BaseEntity, GeoPoint } from './common';
import type { ProviderType, Role } from './enums';

export interface TrustInfo {
  phoneVerified: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  businessVerified: boolean;
  completedTransactions: number;
  ratingAverage: number;
  ratingCount: number;
  cancellationRate: number; // 0..1
  responseRate: number; // 0..1
  avgResponseMinutes?: number;
}

export interface ProviderProfile {
  isProvider: boolean;
  providerType?: ProviderType;
  businessName?: string;
  description?: string;
  serviceCategories?: string[]; // Category ids
}

export interface PublicUser extends BaseEntity {
  name: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  roles: Role[];
  provider?: ProviderProfile;
  trust: TrustInfo;
  isBanned?: boolean;
}

export interface User extends PublicUser {
  email: string;
  phone?: string;
  approxLocation?: GeoPoint;
}

export interface Address extends BaseEntity {
  userId: string;
  label: string; // "Home", "Office"
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: GeoPoint;
  isDefault: boolean;
}
