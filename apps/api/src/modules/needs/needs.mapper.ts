import type { Need as NeedWire } from '@needx/types';
import type { NeedDocument } from './schemas/need.schema';
import { toIdString, toOptionalIdString } from '../../common/utils/id.util';

export function toNeedWire(doc: NeedDocument): NeedWire {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    userId: toIdString(json.userId),
    title: json.title,
    description: json.description,
    categoryId: toOptionalIdString(json.categoryId),
    modes: json.modes,
    budget: json.budget,
    quantity: json.quantity,
    dateRange: json.dateRange
      ? {
          start: json.dateRange.start ? new Date(json.dateRange.start).toISOString() : undefined,
          end: json.dateRange.end ? new Date(json.dateRange.end).toISOString() : undefined,
        }
      : undefined,
    location: json.location,
    attributes: json.attributes ?? {},
    status: json.status,
    rawInput: json.rawInput,
    parseSource: json.parseSource,
    matchCount: json.matchCount,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}
