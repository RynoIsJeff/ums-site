"use client";

import { useActionState } from "react";
import { recordPayment } from "../actions";

type Props = {
  clientId: string;
  invoiceId: string;
  invoiceNumber: string;
  remaining: number;
};

export function RecordPaymentForm({ clientId, invoiceId, invoiceNumber, remaining }: Props) {
  const [state, formAction] = useActionState(recordPayment, {});

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-lg border border-black/10 bg-black/2 p-4">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <p className="text-sm font-medium">Record payment for {invoiceNumber}</p>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-xs font-medium text-black/60">Amount (R)</label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            required
            defaultValue={remaining > 0 ? String(remaining) : ""}
            placeholder="0"
            className="mt-0.5 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="paidAt" className="block text-xs font-medium text-black/60">Date</label>
          <input
            id="paidAt"
            name="paidAt"
            type="date"
            required
            defaultValue={today}
            className="mt-0.5 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="method" className="block text-xs font-medium text-black/60">Method</label>
          <select
            id="method"
            name="method"
            required
            className="mt-0.5 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            <option value="EFT">EFT</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="reference" className="block text-xs font-medium text-black/60">Reference</label>
          <input
            id="reference"
            name="reference"
            type="text"
            placeholder="e.g. EFT ref"
            className="mt-0.5 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-black/60">Notes</label>
        <input
          id="notes"
          name="notes"
          type="text"
          className="mt-0.5 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90"
      >
        Record payment
      </button>
    </form>
  );
}
