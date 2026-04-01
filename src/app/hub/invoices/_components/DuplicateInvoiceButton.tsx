"use client";

import { useTransition } from "react";
import { duplicateInvoice } from "../actions";

type Props = {
  invoiceId: string;
  /** Table row: text link style */
  compact?: boolean;
};

export function DuplicateInvoiceButton({ invoiceId, compact }: Props) {
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(() => {
      void duplicateInvoice(invoiceId);
    });
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className="text-(--hub-muted) hover:underline disabled:opacity-50"
      >
        {pending ? "Copying…" : "Copy"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
    >
      {pending ? "Copying…" : "Duplicate"}
    </button>
  );
}
