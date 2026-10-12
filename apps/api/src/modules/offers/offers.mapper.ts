import type { Offer as OfferWire, OfferHistoryEntry } from '@needx/types';
import type { OfferDocument } from './schemas/offer.schema';
import type { OfferHistoryDocument } from './schemas/offer-history.schema';
import { toIdString, toOptionalIdString } from '../../common/utils/id.util';

export function toOfferWire(doc: OfferDocument, history: OfferHistoryDocument[] = []): OfferWire {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    needId: toIdString(json.needId),
    providerId: toIdString(json.providerId),
    listingId: toOptionalIdString(json.listingId),
    mode: json.mode,
    price: json.price,
    deposit: json.deposit,
    deliveryFee: json.deliveryFee,
    currency: json.currency,
    message: json.message,
    availability: json.availability,
    expiresAt: json.expiresAt,
    status: json.status,
    history: history.map(toHistoryEntry),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

function toHistoryEntry(doc: OfferHistoryDocument): OfferHistoryEntry {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    actorId: toIdString(json.actorId),
    action: json.action,
    price: json.price,
    message: json.message,
    at: json.createdAt,
  };
}
