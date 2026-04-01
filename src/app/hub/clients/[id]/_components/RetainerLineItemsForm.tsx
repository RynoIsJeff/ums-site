"use client";

import { useActionState } from "react";
import {
  updateClientRetainerLineItems,
  type RetainerLineItemsFormState,
} from "../../actions";
import type { RetainerInvoiceLineTemplate } from "@/lib/retainer-invoice-lines";

const LINE_ROWS = 5;

type Props = {
  clientId: string;
  defaultLines: RetainerInvoiceLineTemplate[];
};

export function RetainerLineItemsForm({ clientId, defaultLines }: Props) {
  const bound = updateClientRetainerLineItems.bind(null, clientId);
  const [state, formAction] = useActionState(
    bound,
    {} as RetainerLineItemsFormState
  );

  const rows = Math.max(LINE_ROWS, defaultLines.length || 1);
  const lineRows = Array.from(
    { length: rows },
    (_, i) => defaultLines[i] ?? { description: "", quantity: 1, unitPrice: 0 }
  );

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

      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-(--hub-muted)">
        <div className="col-span-6">Description</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-3">Unit price (R)</div>
      </div>
      <div className="space-y-2">
        {lineRows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              name="retainerDescription"
              placeholder="e.g. Social media management"
              defaultValue={row.description}
              className="col-span-6 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm"
            />
            <input
              name="retainerQuantity"
              type="text"
              inputMode="decimal"
              defaultValue={row.quantity}
              className="col-span-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm"
            />
            <input
              name="retainerUnitPrice"
              type="text"
              inputMode="decimal"
              defaultValue={row.unitPrice}
              className="col-span-3 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-(--hub-muted)">
        Leave descriptions empty to skip a row. If all rows are empty, automated retainer
        invoices use a single line from the retainer amount. If you add lines here, the
        monthly (or quarterly/annual) cron invoice uses these lines and their totals.
      </p>
      <button
        type="submit"
        className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Save retainer invoice lines
      </button>
    </form>
  );
}
