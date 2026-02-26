/**
 * Coerce any value to a number. Returns 0 for null, undefined, NaN, or
 * non-numeric strings. Used for Prisma Decimal/string amounts.
 */
export function toNum(d: unknown): number {
  if (d == null) return 0;
  if (typeof d === "number" && !Number.isNaN(d)) return d;
  return Number(d) || 0;
}
