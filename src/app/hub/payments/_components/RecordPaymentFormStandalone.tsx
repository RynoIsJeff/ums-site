"use client";

import { useActionState } from "react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { useState, useRef } from "react";
import { recordPayment } from "../actions";

type Client = { id: string; companyName: string };
type UnpaidInvoice = { id: string; invoiceNumber: string; clientId: string; totalAmount?: string };

type Props = {
  clients: Client[];
  unpaidInvoices: UnpaidInvoice[];
};

export function RecordPaymentFormStandalone({ clients, unpaidInvoices }: Props) {
  const [state, formAction] = useActionState(recordPayment, {});
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const invoicesForClient = selectedClientId
    ? unpaidInvoices.filter((inv) => inv.clientId === selectedClientId)
    : [];

  const selectedInvoice = invoicesForClient.find((inv) => inv.id === selectedInvoiceId);
  const invoiceBalance = selectedInvoice?.totalAmount ? parseFloat(selectedInvoice.totalAmount) : null;

  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!invoiceBalance) return; // no invoice selected, allow through

    const amountInput = e.currentTarget.elements.namedItem("amount") as HTMLInputElement;
    const amount = parseFloat(amountInput?.value?.replace(/,/g, "") ?? "0");

    if (amount > invoiceBalance) {
      e.preventDefault();
      const over = (amount - invoiceBalance).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const confirmed = confirm(
        `This payment of R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })} exceeds the invoice balance by R ${over}.\n\nDo you want to record it anyway?`
      );
      if (confirmed && formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="mt-4 space-y-4">
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
          onChange={(e) => { setSelectedClientId(e.target.value); setSelectedInvoiceId(""); }}
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
          value={selectedInvoiceId}
          onChange={(e) => setSelectedInvoiceId(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="">— None —</option>
          {invoicesForClient.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoiceNumber}{inv.totalAmount ? ` · R ${parseFloat(inv.totalAmount).toLocaleString("en-ZA")}` : ""}
            </option>
          ))}
        </select>
        {invoiceBalance !== null && (
          <p className="mt-1 text-xs text-(--hub-muted)">
            Invoice balance: <span className="font-medium">R {invoiceBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
          </p>
        )}
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
      <PendingSubmitButton className="rounded-md border border-transparent bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
        Record payment
      </PendingSubmitButton>
    </form>
  );
}
