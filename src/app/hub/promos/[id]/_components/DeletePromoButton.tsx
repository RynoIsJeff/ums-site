"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePromo } from "../../actions";

export function DeletePromoButton({ promoId }: { promoId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    const res = await deletePromo(promoId);
    if (res?.error) { setError(res.error); setLoading(false); return; }
    router.push("/hub/promos");
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {error && <span className="text-xs text-red-700">{error}</span>}
      <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/80 px-2 py-1">
        <span className="text-xs text-red-800 mr-1">Delete promo?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); setError(null); }}
          disabled={loading}
          className="rounded border border-black/15 px-2 py-0.5 text-xs hover:bg-black/5 disabled:opacity-50"
        >
          No
        </button>
      </span>
    </span>
  );
}
