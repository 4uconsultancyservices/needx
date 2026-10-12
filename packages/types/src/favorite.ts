import type { BaseEntity } from './common';

export type FavoriteTargetType = 'LISTING' | 'PROVIDER' | 'NEED';

export interface Favorite extends BaseEntity {
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
}
