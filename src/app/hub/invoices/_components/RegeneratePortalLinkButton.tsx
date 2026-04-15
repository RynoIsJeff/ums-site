"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { regeneratePortalToken } from "../actions";

type Props = { invoiceId: string };

export function RegeneratePortalLinkButton({ invoiceId }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Regenerate the client portal link? The old link will stop working.")) return;
    startTransition(async () => {
      const result = await regeneratePortalToken(invoiceId);
      if (result.error) alert(result.error);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-(--primary) hover:underline disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Regenerating…" : "Regenerate portal link"}
    </button>
  );
}
