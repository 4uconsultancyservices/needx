import { SetMetadata } from '@nestjs/common';
import type { Role } from '@needx/types';

export const ROLES_KEY = 'roles';
/** Marks a route as requiring at least one of the given roles (see RolesGuard). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
