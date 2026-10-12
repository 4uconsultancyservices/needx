import type { Listing as ListingWire } from '@needx/types';
import type { ListingDocument } from './schemas/listing.schema';
import { toIdString } from '../../common/utils/id.util';

export function toListingWire(doc: ListingDocument): ListingWire {
  const json = doc.toJSON() as any;
  return {
    id: toIdString(json.id ?? json._id),
    providerId: toIdString(json.providerId),
    categoryId: toIdString(json.categoryId),
    title: json.title,
    description: json.description,
    type: json.type,
    modes: json.modes,
    price: json.price,
    deposit: json.deposit,
    quantity: json.quantity,
    condition: json.condition,
    images: json.images ?? [],
    location: json.location,
    attributes: json.attributes ?? {},
    status: json.status,
    viewCount: json.viewCount,
    favoriteCount: json.favoriteCount,
    protection: json.protection,
    specifications: json.specifications,
    rentalTerms: json.rentalTerms,
    gallery: json.gallery ?? [],
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}
