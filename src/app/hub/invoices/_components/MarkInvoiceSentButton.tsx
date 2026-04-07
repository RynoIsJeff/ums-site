"use client";

import { useActionState } from "react";
import { setInvoiceStatusForm } from "../actions";

type Props = { invoiceId: string };

/**
 * List row: mark draft as Sent (same server path as invoice detail — portal link + email when configured).
 */
export function MarkInvoiceSentButton({ invoiceId }: Props) {
  const [state, action] = useActionState(
    (prev: { error?: string; emailError?: string }, formData: FormData) =>
      setInvoiceStatusForm(invoiceId, prev, formData),
    {}
  );

  return (
    <span className="inline-flex flex-col items-end gap-1 text-right">
      {state?.emailError && (
        <span className="max-w-[220px] text-[10px] leading-snug text-amber-700">
          Sent, but email failed: {state.emailError}
        </span>
      )}
      {state?.error && (
        <span className="max-w-[220px] text-[10px] text-red-700">{state.error}</span>
      )}
      <form action={action} className="inline">
        <input type="hidden" name="status" value="SENT" />
        <button
          type="submit"
          className="text-sm font-medium text-(--primary) hover:underline disabled:opacity-50"
        >
          Mark sent
        </button>
      </form>
    </span>
  );
}
