"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  updateClientRetainerLineItems,
  type RetainerLineItemsFormState,
} from "../../actions";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import type { RetainerInvoiceLineTemplate } from "@/lib/retainer-invoice-lines";

type Row = { id: string; description: string; quantity: string; unitPrice: string };

function makeRow(t?: RetainerInvoiceLineTemplate): Row {
  return {
    id: `row-${Math.random().toString(36).slice(2)}`,
    description: t?.description ?? "",
    quantity: t ? String(t.quantity) : "1",
    unitPrice: t ? String(t.unitPrice) : "",
  };
}

type Props = {
  clientId: string;
  defaultLines: RetainerInvoiceLineTemplate[];
};

export function RetainerLineItemsForm({ clientId, defaultLines }: Props) {
  const bound = updateClientRetainerLineItems.bind(null, clientId);
  const [state, formAction] = useActionState(bound, {} as RetainerLineItemsFormState);

  const [rows, setRows] = useState<Row[]>(() =>
    defaultLines.length > 0
      ? defaultLines.map((l) => makeRow(l))
      : [makeRow()]
  );

  const addRow = () => setRows((prev) => [...prev, makeRow()]);
  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const updateRow = (id: string, field: keyof Omit<Row, "id">, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const total = rows.reduce((sum, r) => {
    const qty = parseFloat(r.quantity) || 0;
    const price = parseFloat(r.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <p className="text-sm text-emerald-700">Retainer invoice lines saved.</p>
      )}

      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-(--hub-muted) px-1">
        <div className="col-span-6">Description</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-3">Unit price (R)</div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
            <input
              name="retainerDescription"
              placeholder="e.g. Social media management"
              value={row.description}
              onChange={(e) => updateRow(row.id, "description", e.target.value)}
              className="col-span-6 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
            />
            <input
              name="retainerQuantity"
              type="text"
              inputMode="decimal"
              value={row.quantity}
              onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
              className="col-span-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
            />
            <input
              name="retainerUnitPrice"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={row.unitPrice}
              onChange={(e) => updateRow(row.id, "unitPrice", e.target.value)}
              className="col-span-3 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
              className="col-span-1 flex items-center justify-center rounded-md p-2 text-black/40 hover:text-red-500 disabled:opacity-20"
              aria-label="Remove line"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-md border border-(--hub-border-light) px-3 py-1.5 text-sm font-medium hover:bg-black/5"
        >
          <Plus className="h-4 w-4" />
          Add line
        </button>
        {total > 0 && (
          <p className="text-sm font-medium">
            Total: R {total.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>

      <p className="text-xs text-(--hub-muted)">
        Leave all descriptions empty to use the retainer amount as a single line. If any lines
        are filled, recurring invoices are built from these lines.
      </p>

      <PendingSubmitButton className="rounded-md border border-transparent bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
        Save invoice lines
      </PendingSubmitButton>
    </form>
  );
}
