"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "../actions";

type Props = {
  invoiceId: string;
  invoiceNumber: string;
  /** Table row: link-style control; default: bordered button */
  compact?: boolean;
  /** After successful delete: stay on current page (list + filters) or go to invoice index */
  afterDelete?: "refresh" | "invoices";
};

export function DeleteInvoiceButton({
  invoiceId,
  invoiceNumber,
  compact,
  afterDelete = "refresh",
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    const result = await deleteInvoice(invoiceId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (afterDelete === "invoices") {
      router.push("/hub/invoices");
    }
    router.refresh();
  }

  if (!confirming) {
    if (compact) {
      return (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        Delete draft
      </button>
    );
  }

  return (
    <div className={compact ? "inline-flex flex-col items-end gap-1" : "space-y-2"}>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div
        className={
          compact
            ? "flex flex-wrap items-center justify-end gap-2 rounded-lg border border-red-200 bg-red-50/80 px-2 py-1.5 text-left"
            : "flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-3"
        }
      >
        <span className="text-sm text-red-800">
          Delete {invoiceNumber}?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:text-sm sm:px-3 sm:py-1.5"
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={loading}
          className="rounded-md border border-black/15 px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-50 sm:text-sm sm:px-3 sm:py-1.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
