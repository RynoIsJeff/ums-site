"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";

export type LineItemDefault = {
  description: string;
  details?: string | null;
  quantity: number;
  unitPrice: number;
};

export type CreditLineDefault = { description: string; amount: number };

type Row = {
  id: string;
  description: string;
  details: string;
  quantity: string;
  unitPrice: string;
  detailsOpen: boolean;
};

type CreditRow = { id: string; description: string; amount: string };

function makeRow(src?: LineItemDefault): Row {
  return {
    id: `r-${Math.random().toString(36).slice(2)}`,
    description: src?.description ?? "",
    details: src?.details ?? "",
    quantity: src ? String(src.quantity) : "1",
    unitPrice: src ? String(src.unitPrice) : "",
    detailsOpen: !!(src?.details?.trim()),
  };
}

function makeCreditRow(src?: CreditLineDefault): CreditRow {
  return {
    id: `c-${Math.random().toString(36).slice(2)}`,
    description: src?.description ?? "",
    amount: src?.amount ? String(src.amount) : "",
  };
}

type Props = {
  defaultLineItems?: LineItemDefault[];
  minRows?: number;
  allowCredits?: boolean;
  defaultCredits?: CreditLineDefault[];
};

export function LineItemsFieldset({
  defaultLineItems = [],
  allowCredits = false,
  defaultCredits = [],
}: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    defaultLineItems.length > 0
      ? defaultLineItems.map((l) => makeRow(l))
      : [makeRow()]
  );

  const addRow = () => setRows((prev) => [...prev, makeRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const updateRow = (id: string, field: keyof Omit<Row, "id">, value: string | boolean) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const lineTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.unitPrice) || 0),
    0
  );

  return (
    <div>
      <h3 className="text-sm font-medium">Line items</h3>
      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-black/60">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-3">Unit price (R)</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        {rows.map((row) => {
          const rowTotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0);
          return (
            <div key={row.id} className="space-y-1.5">
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  name="description"
                  placeholder="Description"
                  value={row.description}
                  onChange={(e) => updateRow(row.id, "description", e.target.value)}
                  className="col-span-5 rounded-md border border-black/15 px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                />
                <input
                  name="quantity"
                  type="text"
                  inputMode="decimal"
                  placeholder="1"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                  className="col-span-2 rounded-md border border-black/15 px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                />
                <input
                  name="unitPrice"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={row.unitPrice}
                  onChange={(e) => updateRow(row.id, "unitPrice", e.target.value)}
                  className="col-span-3 rounded-md border border-black/15 px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                />
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {rowTotal > 0 && (
                    <span className="text-xs text-black/50 tabular-nums whitespace-nowrap">
                      {rowTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="ml-1 rounded p-1 text-black/30 hover:text-red-500 disabled:opacity-20 shrink-0"
                    aria-label="Remove line"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Details expand toggle */}
              <div className="pl-1">
                <button
                  type="button"
                  onClick={() => updateRow(row.id, "detailsOpen", !row.detailsOpen)}
                  aria-expanded={row.detailsOpen}
                  className="inline-flex items-center gap-1 text-xs text-black/50 hover:text-black"
                >
                  {row.detailsOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {row.detailsOpen ? "Hide details" : "Add details"}
                </button>
              </div>

              {/* Details textarea — always mounted so the field index stays aligned */}
              <textarea
                name="details"
                rows={3}
                value={row.details}
                onChange={(e) => updateRow(row.id, "details", e.target.value)}
                placeholder="Optional longer description — press Enter for new lines."
                className={`w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary) ${row.detailsOpen ? "" : "hidden"}`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer: add line + running total */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
        >
          <Plus className="h-4 w-4" />
          Add line
        </button>
        {lineTotal > 0 && (
          <p className="text-sm text-black/60">
            Subtotal:{" "}
            <span className="font-medium text-black">
              R {lineTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        )}
      </div>

      {allowCredits && <CreditSection defaultCredits={defaultCredits} />}
    </div>
  );
}

function CreditSection({ defaultCredits }: { defaultCredits: CreditLineDefault[] }) {
  const [open, setOpen] = useState(defaultCredits.length > 0);
  const [rows, setRows] = useState<CreditRow[]>(() =>
    defaultCredits.length > 0 ? defaultCredits.map((c) => makeCreditRow(c)) : [makeCreditRow()]
  );

  const addRow = () => setRows((prev) => [...prev, makeCreditRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  const updateRow = (id: string, field: keyof Omit<CreditRow, "id">, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  return (
    <div className="mt-6 border-t border-black/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-sm font-medium text-black/70 hover:text-black"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Credits / discounts
        {defaultCredits.length > 0 && (
          <span className="ml-1 rounded bg-black/5 px-1.5 py-0.5 text-xs font-normal">
            {defaultCredits.length}
          </span>
        )}
      </button>
      <p className="mt-1 text-xs text-black/60">
        Money off this invoice — a discount, goodwill or a returned item. Enter the amount as a
        positive number; it is deducted from the total.
      </p>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-black/60">
            <div className="col-span-9">Reason shown on the invoice</div>
            <div className="col-span-2">Amount (R)</div>
          </div>
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                name="creditDescription"
                placeholder="e.g. Goodwill discount"
                value={row.description}
                onChange={(e) => updateRow(row.id, "description", e.target.value)}
                className="col-span-9 rounded-md border border-black/15 px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
              />
              <input
                name="creditAmount"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={row.amount}
                onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                className="col-span-2 rounded-md border border-black/15 px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                className="col-span-1 flex justify-center rounded p-1 text-black/30 hover:text-red-500 disabled:opacity-20"
                aria-label="Remove credit"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-black"
          >
            <Plus className="h-3.5 w-3.5" />
            Add credit
          </button>
        </div>
      )}
    </div>
  );
}
