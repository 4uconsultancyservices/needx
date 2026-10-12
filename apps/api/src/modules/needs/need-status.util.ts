import type { NeedStatus } from '@needx/types';

const TRANSITIONS: Record<NeedStatus, NeedStatus[]> = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['MATCHING', 'FULFILLED', 'EXPIRED', 'CANCELLED'],
  MATCHING: ['ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED'],
  FULFILLED: [],
  EXPIRED: ['ACTIVE'],
  CANCELLED: [],
};

export function canTransitionNeed(from: NeedStatus, to: NeedStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}
