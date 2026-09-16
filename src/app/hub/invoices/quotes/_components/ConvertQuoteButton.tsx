"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { convertQuoteToInvoice } from "../actions";

type Props = {
  quoteId: string;
  /** Table row: text link style */
  compact?: boolean;
};

/** Creates a draft invoice from an accepted quote and opens it. */
export function ConvertQuoteButton({ quoteId, compact }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle() {
    setError(null);
    startTransition(async () => {
      const result = await convertQuoteToInvoice(quoteId);
      if (result?.error) setError(result.error);
    });
  }

  if (compact) {
    return (
      <span className="inline-flex flex-col items-end gap-1 text-right">
        {error && <span className="max-w-[220px] text-[10px] text-red-700">{error}</span>}
        <button
          type="button"
          onClick={handle}
          disabled={pending}
          className="font-medium text-(--primary) hover:underline disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create invoice"}
        </button>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        <FileText className="h-4 w-4" />
        {pending ? "Creating invoice…" : "Create invoice from quote"}
      </button>
    </div>
  );
}
