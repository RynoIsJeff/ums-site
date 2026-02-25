"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "../../actions";

type Props = { clientId: string; companyName: string };

export function DeleteClientButton({ clientId, companyName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    const result = await deleteClient(clientId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        Delete client
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
        <span className="text-sm text-red-800">
          Delete &ldquo;{companyName}&rdquo;? This cannot be undone.
        </span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => { setConfirming(false); setError(null); }}
        disabled={loading}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
      >
        Cancel
      </button>
      </div>
    </div>
  );
}
