"use client";

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
  const action = async (formData: FormData) => {
    await setInvoiceStatusForm(invoiceId, {}, formData);
  };

  return (
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
  );
}
