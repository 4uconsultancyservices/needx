/**
 * Safely converts an ObjectId, document, populated document, or string/number into a clean hex ID string.
 *
 * NOTE: In Mongoose/BSON, `ObjectId.prototype.id` is the 12-byte raw binary Buffer, NOT the string!
 * Accessing `val.id` when `val` is an ObjectId causes `String(val.id)` to produce corrupt binary characters
 * (e.g. "j\uFFFD4\uFFFD..."). This utility prevents that bug.
 */
export function toIdString(val: any): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (val._id) return String(val._id);
  if (typeof val.id === 'string') return val.id;
  return String(val);
}

export function toOptionalIdString(val: any): string | undefined {
  if (val == null) return undefined;
  const str = toIdString(val);
  return str.length > 0 ? str : undefined;
}
