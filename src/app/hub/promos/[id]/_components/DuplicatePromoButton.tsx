"use client";

import { useTransition } from "react";
import { Copy } from "lucide-react";
import { duplicatePromo } from "../../actions";

export function DuplicatePromoButton({ promoId }: { promoId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => duplicatePromo(promoId))}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm font-medium text-(--hub-text) hover:bg-black/5 disabled:opacity-50"
    >
      <Copy className="h-4 w-4" />
      {isPending ? "Duplicating…" : "Duplicate"}
    </button>
  );
}
