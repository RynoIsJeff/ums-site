"use client";

import { useActionState } from "react";
import { setQuoteStatusForm } from "../actions";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";
import type { QuoteStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "DRAFT", label: "Back to Draft" },
  { value: "SENT", label: "Mark as Sent" },
  { value: "ACCEPTED", label: "Mark as Accepted" },
  { value: "DECLINED", label: "Mark as Declined" },
  { value: "EXPIRED", label: "Mark Expired" },
];

type Props = { quoteId: string; currentStatus: QuoteStatus };

export function SetQuoteStatusButton({ quoteId, currentStatus }: Props) {
  const [state, action] = useActionState(
    (prev: { error?: string; emailError?: string }, formData: FormData) =>
      setQuoteStatusForm(quoteId, prev, formData),
    {}
  );

  // A converted quote is final — its invoice is the live document now.
  if (currentStatus === "CONVERTED") return null;

  return (
    <div className="flex flex-col gap-2">
      {state?.emailError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Quote marked as sent, but email could not be delivered: {state.emailError}
        </p>
      )}
      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.filter((o) => o.value !== currentStatus).map((opt) => (
          <form key={opt.value} action={action} className="inline">
            <input type="hidden" name="status" value={opt.value} />
            <PendingSubmitButton className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5">
              {opt.label}
            </PendingSubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
