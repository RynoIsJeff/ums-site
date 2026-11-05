export type RetainerInvoiceLineTemplate = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type RetainerInvoiceGroup = {
  name: string;
  lines: RetainerInvoiceLineTemplate[];
};

function normalizeLine(o: Record<string, unknown>): RetainerInvoiceLineTemplate | null {
  const desc = typeof o.description === "string" ? o.description.trim() : "";
  if (!desc) return null;
  const qty = Number(o.quantity);
  const unit = Number(o.unitPrice);
  return {
    description: desc.slice(0, 500),
    quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
    unitPrice: Number.isFinite(unit) && unit >= 0 ? unit : 0,
  };
}

/**
 * Parse client.retainerLineItems JSON into normalized invoice groups.
 * Handles both formats:
 *   - Old flat: [{ description, quantity, unitPrice }, ...]
 *   - New grouped: [{ name, lines: [{ description, quantity, unitPrice }] }, ...]
 */
export function normalizeRetainerGroups(value: unknown): RetainerInvoiceGroup[] {
  if (!value || !Array.isArray(value) || value.length === 0) return [];

  const first = value[0] as Record<string, unknown>;

  // New grouped format
  if (first && typeof first === "object" && Array.isArray(first.lines)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const o = item as Record<string, unknown>;
        const name = typeof o.name === "string" ? o.name.trim() : "";
        const lines = Array.isArray(o.lines)
          ? o.lines.flatMap((l) => {
              const line = normalizeLine(l as Record<string, unknown>);
              return line ? [line] : [];
            })
          : [];
        if (lines.length === 0) return null;
        return { name, lines } satisfies RetainerInvoiceGroup;
      })
      .filter((g): g is RetainerInvoiceGroup => g !== null);
  }

  // Old flat format — wrap as one unnamed group
  const lines = value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const line = normalizeLine(row as Record<string, unknown>);
    return line ? [line] : [];
  });
  return lines.length > 0 ? [{ name: "", lines }] : [];
}

/** Legacy compat — returns lines from the first group only. */
export function normalizeRetainerLineItemsJson(
  value: unknown
): RetainerInvoiceLineTemplate[] {
  const groups = normalizeRetainerGroups(value);
  return groups.flatMap((g) => g.lines);
}
