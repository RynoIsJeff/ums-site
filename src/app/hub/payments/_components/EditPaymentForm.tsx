"use client";

import { useActionState, useRef, useState } from "react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { updatePayment } from "../actions";
import type { PaymentFormState } from "../actions";

type AllocationRow = { invoiceId: string; allocatedAmount: string };

type AvailableInvoice = {
  id: string;
  invoiceNumber: string;
  remainingAmount: string;
};

type Props = {
  paymentId: string;
  clientName: string;
  defaultAmount: string;
  defaultPaidAt: string;
  defaultMethod: string;
  defaultReference: string;
  defaultNotes: string;
  currentAllocations: { invoiceId: string; invoiceNumber: string; allocatedAmount: string }[];
  availableInvoices: AvailableInvoice[];
};

export function EditPaymentForm({
  paymentId,
  clientName,
  defaultAmount,
  defaultPaidAt,
  defaultMethod,
  defaultReference,
  defaultNotes,
  currentAllocations,
  availableInvoices,
}: Props) {
  const boundAction = updatePayment.bind(null, paymentId);
  const [state, formAction] = useActionState<PaymentFormState, FormData>(boundAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  const [allocations, setAllocations] = useState<AllocationRow[]>(
    currentAllocations.map((a) => ({ invoiceId: a.invoiceId, allocatedAmount: a.allocatedAmount }))
  );

  const totalAllocated = allocations.reduce((s, a) => s + (parseFloat(a.allocatedAmount) || 0), 0);
  const usedInvoiceIds = new Set(allocations.map((a) => a.invoiceId).filter(Boolean));

  const availableForRow = (rowInvoiceId: string) =>
    availableInvoices.filter((inv) => inv.id === rowInvoiceId || !usedInvoiceIds.has(inv.id));

  const canAddRow = allocations.length < availableInvoices.length;

  const addRow = () => setAllocations((prev) => [...prev, { invoiceId: "", allocatedAmount: "" }]);

  const removeRow = (i: number) => setAllocations((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof AllocationRow, value: string) => {
    setAllocations((prev) =>
      prev.map((row, idx) => {
        if (idx !== i) return row;
        const updated = { ...row, [field]: value };
        if (field === "invoiceId" && value) {
          const inv = availableInvoices.find((inv) => inv.id === value);
          if (inv) updated.allocatedAmount = inv.remainingAmount;
        }
        return updated;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const amountInput = e.currentTarget.elements.namedItem("amount") as HTMLInputElement;
    const totalAmount = parseFloat(amountInput?.value?.replace(/,/g, "") ?? "0");

    const valid = allocations.filter((a) => a.invoiceId && parseFloat(a.allocatedAmount) > 0);

    if (valid.length > 0 && totalAllocated > totalAmount) {
      e.preventDefault();
      const over = (totalAllocated - totalAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
      alert(`Total allocated (R ${totalAllocated.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}) exceeds the payment amount by R ${over}. Please adjust.`);
      return;
    }

    const allocationsInput = e.currentTarget.elements.namedItem("allocations") as HTMLInputElement;
    if (allocationsInput) {
      allocationsInput.value = JSON.stringify(
        valid.map((a) => ({ invoiceId: a.invoiceId, allocatedAmount: a.allocatedAmount }))
      );
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="allocations" defaultValue="" />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label className="block text-sm font-medium">Client</label>
        <p className="mt-1 rounded-md border border-black/10 bg-black/3 px-3 py-2 text-sm text-(--hub-muted)">
          {clientName}
        </p>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium">Amount (R) *</label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          required
          defaultValue={defaultAmount}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="paidAt" className="block text-sm font-medium">Date *</label>
        <input
          id="paidAt"
          name="paidAt"
          type="date"
          required
          defaultValue={defaultPaidAt}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="method" className="block text-sm font-medium">Method *</label>
        <select
          id="method"
          name="method"
          required
          defaultValue={defaultMethod}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="EFT">EFT</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="reference" className="block text-sm font-medium">Reference</label>
        <input
          id="reference"
          name="reference"
          type="text"
          defaultValue={defaultReference}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
        <input
          id="notes"
          name="notes"
          type="text"
          defaultValue={defaultNotes}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      {/* Invoice allocations */}
      <div>
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium">Invoice allocations</span>
          {canAddRow && (
            <button type="button" onClick={addRow} className="text-xs text-black/60 underline hover:text-black">
              + Add invoice
            </button>
          )}
        </div>
        {availableInvoices.length === 0 && (
          <p className="mt-1 text-xs text-(--hub-muted)">No invoices available to allocate.</p>
        )}
        {allocations.length > 0 && (
          <div className="mt-2 space-y-2">
            {allocations.map((row, i) => {
              const options = availableForRow(row.invoiceId);
              const selInv = availableInvoices.find((inv) => inv.id === row.invoiceId);
              return (
                <div key={i} className="flex items-start gap-2">
                  <select
                    value={row.invoiceId}
                    onChange={(e) => updateRow(i, "invoiceId", e.target.value)}
                    className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm"
                  >
                    <option value="">Select invoice</option>
                    {options.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} · R {parseFloat(inv.remainingAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })} remaining
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Amount"
                    value={row.allocatedAmount}
                    onChange={(e) => updateRow(i, "allocatedAmount", e.target.value)}
                    className="w-28 rounded-md border border-black/15 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="mt-2 text-xs text-black/40 hover:text-red-500"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                  {selInv && parseFloat(row.allocatedAmount) > parseFloat(selInv.remainingAmount) && (
                    <span className="mt-2 text-xs text-amber-600">Exceeds balance</span>
                  )}
                </div>
              );
            })}
            {totalAllocated > 0 && (
              <p className="text-xs text-(--hub-muted)">
                Allocated:{" "}
                <span className="font-medium">
                  R {totalAllocated.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </span>
              </p>
            )}
          </div>
        )}
        {availableInvoices.length > 0 && allocations.length === 0 && (
          <button type="button" onClick={addRow} className="mt-2 text-xs text-black/60 underline hover:text-black">
            + Add invoice
          </button>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <PendingSubmitButton className="rounded-md border border-transparent bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
          Save changes
        </PendingSubmitButton>
        <a
          href="/hub/payments"
          className="rounded-md border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
