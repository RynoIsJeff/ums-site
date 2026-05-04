"use client";

import { useActionState } from "react";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import { useState, useRef } from "react";
import { recordPayment } from "../actions";

type Client = { id: string; companyName: string };
type UnpaidInvoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  remainingAmount: string;
};

type AllocationRow = { invoiceId: string; allocatedAmount: string };

type Props = {
  clients: Client[];
  unpaidInvoices: UnpaidInvoice[];
};

export function RecordPaymentFormStandalone({ clients, unpaidInvoices }: Props) {
  const [state, formAction] = useActionState(recordPayment, {});
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const invoicesForClient = selectedClientId
    ? unpaidInvoices.filter((inv) => inv.clientId === selectedClientId)
    : [];

  const totalAllocated = allocations.reduce((s, a) => s + (parseFloat(a.allocatedAmount) || 0), 0);

  const usedInvoiceIds = new Set(allocations.map((a) => a.invoiceId).filter(Boolean));

  const availableForRow = (rowInvoiceId: string) =>
    invoicesForClient.filter((inv) => inv.id === rowInvoiceId || !usedInvoiceIds.has(inv.id));

  const today = new Date().toISOString().slice(0, 10);

  const addAllocationRow = () => {
    setAllocations((prev) => [...prev, { invoiceId: "", allocatedAmount: "" }]);
  };

  const removeAllocationRow = (index: number) => {
    setAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAllocationRow = (index: number, field: keyof AllocationRow, value: string) => {
    setAllocations((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        // Auto-fill amount with remaining balance when invoice is selected
        if (field === "invoiceId" && value) {
          const inv = invoicesForClient.find((inv) => inv.id === value);
          if (inv) updated.allocatedAmount = inv.remainingAmount;
        }
        return updated;
      })
    );
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setAllocations([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const amountInput = e.currentTarget.elements.namedItem("amount") as HTMLInputElement;
    const totalAmount = parseFloat(amountInput?.value?.replace(/,/g, "") ?? "0");

    const validAllocations = allocations.filter((a) => a.invoiceId && parseFloat(a.allocatedAmount) > 0);

    if (validAllocations.length > 0 && totalAllocated > totalAmount) {
      e.preventDefault();
      const over = (totalAllocated - totalAmount).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      alert(`Total allocated (R ${totalAllocated.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}) exceeds the payment amount by R ${over}. Please adjust the amounts.`);
      return;
    }

    // Inject allocations JSON before submission
    const allocationsInput = e.currentTarget.elements.namedItem("allocations") as HTMLInputElement;
    if (allocationsInput) {
      allocationsInput.value = JSON.stringify(
        validAllocations.map((a) => ({ invoiceId: a.invoiceId, allocatedAmount: a.allocatedAmount }))
      );
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="mt-4 space-y-4">
      <input type="hidden" name="allocations" defaultValue="" />
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
          onChange={(e) => handleClientChange(e.target.value)}
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

      {/* Invoice allocations */}
      <div>
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium">Allocate to invoices</span>
          {invoicesForClient.length > 0 && allocations.length < invoicesForClient.length && (
            <button
              type="button"
              onClick={addAllocationRow}
              className="text-xs text-black/60 underline hover:text-black"
            >
              + Add invoice
            </button>
          )}
        </div>
        {selectedClientId && invoicesForClient.length === 0 && (
          <p className="mt-1 text-xs text-(--hub-muted)">No unpaid invoices for this client.</p>
        )}
        {allocations.length > 0 && (
          <div className="mt-2 space-y-2">
            {allocations.map((row, i) => {
              const invOptions = availableForRow(row.invoiceId);
              const selectedInv = invoicesForClient.find((inv) => inv.id === row.invoiceId);
              return (
                <div key={i} className="flex items-start gap-2">
                  <select
                    value={row.invoiceId}
                    onChange={(e) => updateAllocationRow(i, "invoiceId", e.target.value)}
                    className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm"
                  >
                    <option value="">Select invoice</option>
                    {invOptions.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} · R{" "}
                        {parseFloat(inv.remainingAmount).toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        remaining
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Amount"
                    value={row.allocatedAmount}
                    onChange={(e) => updateAllocationRow(i, "allocatedAmount", e.target.value)}
                    className="w-28 rounded-md border border-black/15 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeAllocationRow(i)}
                    className="mt-2 text-xs text-black/40 hover:text-red-500"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                  {selectedInv && parseFloat(row.allocatedAmount) > parseFloat(selectedInv.remainingAmount) && (
                    <p className="text-xs text-amber-600">Exceeds balance</p>
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
        {selectedClientId && invoicesForClient.length > 0 && allocations.length === 0 && (
          <button
            type="button"
            onClick={addAllocationRow}
            className="mt-2 text-xs text-black/60 underline hover:text-black"
          >
            + Add invoice
          </button>
        )}
      </div>

      <PendingSubmitButton className="rounded-md border border-transparent bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
        Record payment
      </PendingSubmitButton>
    </form>
  );
}
