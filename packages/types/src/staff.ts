import type { BaseEntity } from './common';
import type { Role } from './enums';

export const STAFF_MODULES = [
  'dashboard',
  'users',
  'staff',
  'needs',
  'listings',
  'orders',
  'categories',
  'reports',
  'disputes',
  'moderation',
  'reviews',
  'payments',
  'notifications',
  'settings',
] as const;
export type StaffModule = (typeof STAFF_MODULES)[number];

export const STAFF_ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;
export type StaffAction = (typeof STAFF_ACTIONS)[number];

export type StaffPermission =
  | '*'
  | `${StaffModule}:*`
  | `${StaffModule}:${StaffAction}`
  | `${StaffModule}:ban`
  | `${StaffModule}:refund`
  | `${StaffModule}:resolve`
  | `${StaffModule}:broadcast`
  | `${StaffModule}:export`;

export const STAFF_DEPARTMENTS = [
  'EXECUTIVE',
  'TRUST_AND_SAFETY',
  'FINANCE',
  'OPERATIONS',
  'CUSTOMER_SUPPORT',
  'CATALOG_TAXONOMY',
] as const;
export type StaffDepartment = (typeof STAFF_DEPARTMENTS)[number];

export interface StaffProfile extends BaseEntity {
  userId: string;
  department: StaffDepartment;
  designation: string;
  role: Role;
  permissions: string[];
  isSuspended: boolean;
  assignedQueues?: string[];
  lastActiveAt?: string;
}

export interface Employee extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  department: StaffDepartment;
  designation: string;
  role: Role;
  roles: Role[];
  permissions: string[];
  assignedQueues: string[];
  isSuspended: boolean;
  city?: string;
  lastActiveAt?: string;
}

export interface StaffUserRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  roles: Role[];
  staffProfile: StaffProfile;
  isBanned?: boolean;
  createdAt: string;
}

