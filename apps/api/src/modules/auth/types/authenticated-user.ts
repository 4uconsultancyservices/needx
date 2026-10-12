import type { Role } from '@needx/types';

/** Shape attached to `request.user` after JwtAuthGuard runs. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: Role[];
}
