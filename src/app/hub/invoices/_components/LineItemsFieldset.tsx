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

/** A credit/discount taken off the total, e.g. goodwill or a returned item. */
export type CreditLineDefault = { description: string; amount: number };

const CREDIT_ROWS = 3;

type Props = {
  defaultLineItems?: LineItemDefault[];
  /** Blank rows to show when there is nothing to edit yet. */
  minRows?: number;
  /** Show the credits block (invoices only — quotes have no credits). */
  allowCredits?: boolean;
  defaultCredits?: CreditLineDefault[];
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
  allowCredits = false,
  defaultCredits = [],
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

      {allowCredits && <CreditRows defaultCredits={defaultCredits} />}
    </div>
  );
}

/**
 * Credits are entered as a positive amount and come off the total. They are
 * stored as line items with negative amounts, so they show on the invoice,
 * the PDF and the client's copy as a deduction.
 */
function CreditRows({ defaultCredits }: { defaultCredits: CreditLineDefault[] }) {
  const rowCount = Math.max(CREDIT_ROWS, defaultCredits.length);
  const rows = Array.from(
    { length: rowCount },
    (_, i) => defaultCredits[i] ?? { description: "", amount: 0 },
  );
  const [open, setOpen] = useState(defaultCredits.length > 0);

  return (
    <div className="mt-6 border-t border-black/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-sm font-medium text-black/70 hover:text-black"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Credits
        {defaultCredits.length > 0 && (
          <span className="ml-1 rounded bg-black/5 px-1.5 py-0.5 text-xs font-normal">
            {defaultCredits.length}
          </span>
        )}
      </button>
      <p className="mt-1 text-xs text-black/60">
        Money off this invoice — a discount, goodwill or a returned item. Enter
        the amount as a positive number; it is deducted from the total.
      </p>

      <div className={open ? "mt-3 space-y-2" : "hidden"}>
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-black/60">
          <div className="col-span-9">Reason shown on the invoice</div>
          <div className="col-span-3">Amount (R)</div>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              name="creditDescription"
              placeholder="e.g. Goodwill discount"
              defaultValue={row.description}
              className="col-span-9 rounded-md border border-black/15 px-3 py-2 text-sm"
            />
            <input
              name="creditAmount"
              type="text"
              inputMode="decimal"
              defaultValue={row.amount || ""}
              placeholder="0"
              className="col-span-3 rounded-md border border-black/15 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
