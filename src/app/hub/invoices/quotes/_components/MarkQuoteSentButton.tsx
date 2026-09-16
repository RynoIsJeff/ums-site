"use client";

import { useActionState } from "react";
import { setQuoteStatusForm } from "../actions";
import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";

type Props = { quoteId: string };

/** List row: mark a draft quote as Sent (emails the client, same as the detail page). */
export function MarkQuoteSentButton({ quoteId }: Props) {
  const [state, action] = useActionState(
    (prev: { error?: string; emailError?: string }, formData: FormData) =>
      setQuoteStatusForm(quoteId, prev, formData),
    {}
  );

  return (
    <span className="inline-flex flex-col items-end gap-1 text-right">
      {state?.emailError && (
        <span className="max-w-[220px] text-[10px] leading-snug text-amber-700">
          Sent, but email failed: {state.emailError}
        </span>
      )}
      {state?.error && (
        <span className="max-w-[220px] text-[10px] text-red-700">{state.error}</span>
      )}
      <form action={action} className="inline">
        <input type="hidden" name="status" value="SENT" />
        <PendingSubmitButton className="inline-flex min-h-[1.25rem] items-center justify-center border-0 bg-transparent p-0 text-sm font-medium text-(--primary) hover:underline disabled:opacity-50 [&>span]:gap-1.5">
          Mark sent
        </PendingSubmitButton>
      </form>
    </span>
  );
}
