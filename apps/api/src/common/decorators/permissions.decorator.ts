import { SetMetadata } from '@nestjs/common';
import type { StaffPermission } from '@needx/types';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: (StaffPermission | string)[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
