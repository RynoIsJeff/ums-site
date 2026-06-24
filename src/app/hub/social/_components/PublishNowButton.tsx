"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishPostNow } from "../actions";

export function PublishNowButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const result = await publishPostNow(postId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      } else {
        router.refresh();
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md border border-(--primary) bg-(--primary) px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Publish now
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <span className="text-sm text-amber-900">
        Publish immediately to Facebook?
      </span>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="rounded-md bg-(--primary) px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Publishing…" : "Yes, publish"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
