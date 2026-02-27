"use client";

import { useActionState } from "react";
import { setInvoiceStatusForm } from "../actions";
import type { InvoiceStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Mark as Sent" },
  { value: "PAID", label: "Mark as Paid" },
  { value: "OVERDUE", label: "Mark Overdue" },
  { value: "VOID", label: "Void" },
];

type Props = { invoiceId: string; currentStatus: InvoiceStatus };

export function SetInvoiceStatusButton({ invoiceId, currentStatus }: Props) {
  const [state, action] = useActionState(
    (prev: { error?: string; emailError?: string }, formData: FormData) =>
      setInvoiceStatusForm(invoiceId, prev, formData),
    {}
  );

  return (
    <div className="flex flex-col gap-2">
      {state?.emailError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Invoice marked as sent, but email could not be delivered: {state.emailError}
        </p>
      )}
      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.filter((o) => o.value !== currentStatus).map((opt) => (
          <form key={opt.value} action={action} className="inline">
            <input type="hidden" name="status" value={opt.value} />
            <button
              type="submit"
              className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
            >
              {opt.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
