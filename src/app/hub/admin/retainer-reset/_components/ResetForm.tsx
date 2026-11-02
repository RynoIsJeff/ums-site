"use client";

import { useActionState } from "react";
import { resetRetainerInvoices, type ResetState } from "../actions";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";

type Props = { minNum: number; toDeletePreview: { invoiceNumber: string; client: string; total: string }[] };

export function ResetForm({ minNum, toDeletePreview }: Props) {
  const action = resetRetainerInvoices.bind(null, minNum);
  const [state, formAction] = useActionState<ResetState, FormData>(action, {});

  if (state.deleted) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-medium text-emerald-800">Done!</p>
          <p className="mt-1 text-sm text-emerald-700">
            Deleted {state.deleted.length} invoice{state.deleted.length !== 1 ? "s" : ""}:{" "}
            {state.deleted.join(", ")}
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            Created {state.created?.length ?? 0} new retainer invoice{(state.created?.length ?? 0) !== 1 ? "s" : ""}:{" "}
            {state.created?.join(", ") ?? "none"}
          </p>
        </div>
        <a href="/hub/invoices" className="inline-block text-sm font-medium underline">
          View invoices →
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-black/70 mb-2">
          Invoices that will be permanently deleted:
        </p>
        {toDeletePreview.length === 0 ? (
          <p className="text-sm text-black/50 italic">
            No invoices found with number ≥ {String(minNum).padStart(4, "0")}.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-lg border border-black/10 bg-white text-sm">
            {toDeletePreview.map((inv) => (
              <li key={inv.invoiceNumber} className="flex items-center justify-between px-4 py-2.5">
                <span className="font-medium">{inv.invoiceNumber}</span>
                <span className="text-black/60">{inv.client}</span>
                <span className="text-black/60">R {inv.total}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        After deleting, this will immediately re-run the retainer invoice generation for all active
        clients due this month using their current line items.
      </div>

      <PendingSubmitButton className="rounded-md border border-transparent bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
        Delete {toDeletePreview.length} invoice{toDeletePreview.length !== 1 ? "s" : ""} &amp; regenerate
      </PendingSubmitButton>
    </form>
  );
}
