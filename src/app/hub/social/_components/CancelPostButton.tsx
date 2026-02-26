"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPost } from "../actions";

type Props = { postId: string };

export function CancelPostButton({ postId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setConfirming(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      await cancelPost(postId);
      router.refresh();
      setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Cancel post
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
      <span className="text-sm text-red-800">
        Cancel this post? It will not be published.
      </span>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "Cancelling…" : "Yes, cancel"}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-50"
      >
        No, keep it
      </button>
    </div>
  );
}
