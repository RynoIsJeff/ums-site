"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPost } from "../actions";

type Props = { postId: string };

export function CancelPostButton({ postId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Cancel this post? It will not be published.")) return;
    startTransition(async () => {
      await cancelPost(postId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Cancelling…" : "Cancel post"}
    </button>
  );
}
