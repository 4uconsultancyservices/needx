import type { Order as OrderWire } from '@needx/types';
import type { OrderDocument } from './schemas/order.schema';
import { toIdString, toOptionalIdString } from '../../common/utils/id.util';

export function toOrderWire(doc: OrderDocument): OrderWire {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    needId: toOptionalIdString(json.needId),
    offerId: toIdString(json.offerId),
    listingId: toOptionalIdString(json.listingId),
    buyerId: toIdString(json.buyerId),
    providerId: toIdString(json.providerId),
    type: json.type,
    status: json.status,
    amount: json.amount,
    depositAmount: json.depositAmount,
    deliveryFee: json.deliveryFee,
    currency: json.currency,
    quantity: json.quantity,
    statusHistory: (json.statusHistory ?? []).map((h: any) => ({
      status: h.status,
      at: h.at,
      actorId: toOptionalIdString(h.actorId),
      note: h.note,
    })),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}
