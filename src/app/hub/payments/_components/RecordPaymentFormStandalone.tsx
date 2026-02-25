"use client";

import { useActionState } from "react";
import { useState } from "react";
import { recordPayment } from "../actions";

type Client = { id: string; companyName: string };
type UnpaidInvoice = { id: string; invoiceNumber: string; clientId: string };

type Props = {
  clients: Client[];
  unpaidInvoices: UnpaidInvoice[];
};

export function RecordPaymentFormStandalone({ clients, unpaidInvoices }: Props) {
  const [state, formAction] = useActionState(recordPayment, {});
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const invoicesForClient = selectedClientId
    ? unpaidInvoices.filter((inv) => inv.clientId === selectedClientId)
    : [];

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium">
          Client *
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="invoiceId" className="block text-sm font-medium">
          Invoice (optional)
        </label>
        <select
          id="invoiceId"
          name="invoiceId"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">— None —</option>
          {invoicesForClient.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoiceNumber}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount (R) *
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          required
          placeholder="0"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="paidAt" className="block text-sm font-medium">
          Date *
        </label>
        <input
          id="paidAt"
          name="paidAt"
          type="date"
          required
          defaultValue={today}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="method" className="block text-sm font-medium">
          Method *
        </label>
        <select
          id="method"
          name="method"
          required
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="EFT">EFT</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="reference" className="block text-sm font-medium">
          Reference
        </label>
        <input
          id="reference"
          name="reference"
          type="text"
          placeholder="e.g. EFT reference"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
      >
        Record payment
      </button>
    </form>
  );
}
