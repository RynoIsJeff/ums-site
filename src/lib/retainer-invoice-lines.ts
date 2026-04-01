export type RetainerInvoiceLineTemplate = {
  description: string;
  quantity: number;
  unitPrice: number;
};

/** Parse client.retainerLineItems JSON into normalized templates (empty rows skipped). */
export function normalizeRetainerLineItemsJson(
  value: unknown
): RetainerInvoiceLineTemplate[] {
  if (!value || !Array.isArray(value)) return [];
  const out: RetainerInvoiceLineTemplate[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const desc = typeof o.description === "string" ? o.description.trim() : "";
    if (!desc) continue;
    const qty = Number(o.quantity);
    const unit = Number(o.unitPrice);
    out.push({
      description: desc.slice(0, 500),
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      unitPrice: Number.isFinite(unit) && unit >= 0 ? unit : 0,
    });
  }
  return out;
}
