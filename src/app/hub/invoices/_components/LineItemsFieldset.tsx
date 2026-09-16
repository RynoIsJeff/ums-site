"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const DEFAULT_ROWS = 6;

export type LineItemDefault = {
  description: string;
  /** Optional multi-line block shown beneath the description. */
  details?: string | null;
  quantity: number;
  unitPrice: number;
};

type Props = {
  defaultLineItems?: LineItemDefault[];
  /** Blank rows to show when there is nothing to edit yet. */
  minRows?: number;
};

/**
 * Line item rows shared by the invoice and quote forms: description, qty, unit
 * price, plus an optional multi-line detail block underneath. Every row always
 * submits a details field (hidden rows included) so the server can line the
 * values up by index.
 */
export function LineItemsFieldset({
  defaultLineItems = [],
  minRows = DEFAULT_ROWS,
}: Props) {
  const rowCount = Math.max(minRows, defaultLineItems.length || 1);
  const rows = Array.from(
    { length: rowCount },
    (_, i) =>
      defaultLineItems[i] ?? { description: "", details: "", quantity: 1, unitPrice: 0 },
  );

  // Rows that already carry detail start expanded.
  const [openRows, setOpenRows] = useState<Set<number>>(
    () => new Set(rows.flatMap((row, i) => (row.details?.trim() ? [i] : []))),
  );

  const toggle = (i: number) =>
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div>
      <h3 className="text-sm font-medium">Line items</h3>
      <p className="mt-1 text-xs text-black/60">
        Leave description empty to skip a row. Add details for a longer
        description — it keeps your line breaks and paragraphs.
      </p>
      <div className="mt-2 space-y-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-black/60">
          <div className="col-span-6">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-3">Unit price (R)</div>
        </div>
        {rows.map((row, i) => {
          const open = openRows.has(i);
          return (
            <div key={i} className="space-y-1.5">
              <div className="grid grid-cols-12 gap-2">
                <input
                  name="description"
                  placeholder="Description"
                  defaultValue={row.description}
                  className="col-span-6 rounded-md border border-black/15 px-3 py-2 text-sm"
                />
                <input
                  name="quantity"
                  type="text"
                  inputMode="decimal"
                  defaultValue={row.quantity}
                  placeholder="1"
                  className="col-span-2 rounded-md border border-black/15 px-3 py-2 text-sm"
                />
                <input
                  name="unitPrice"
                  type="text"
                  inputMode="decimal"
                  defaultValue={row.unitPrice}
                  placeholder="0"
                  className="col-span-3 rounded-md border border-black/15 px-3 py-2 text-sm"
                />
              </div>
              <div className="pl-1">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={open}
                  aria-controls={`line-details-${i}`}
                  className="inline-flex items-center gap-1 text-xs text-black/50 hover:text-black"
                >
                  {open ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {open ? "Hide details" : "Add details"}
                </button>
              </div>
              {/* Kept mounted while collapsed: hidden fields still submit, which
                  keeps details aligned with their row. */}
              <textarea
                id={`line-details-${i}`}
                name="details"
                rows={3}
                defaultValue={row.details ?? ""}
                placeholder="Optional longer description — press Enter for new lines or paragraphs."
                className={`w-full rounded-md border border-black/15 px-3 py-2 text-sm ${open ? "" : "hidden"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
