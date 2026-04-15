"use client";

import { useRouter } from "next/navigation";
import { PendingSubmitButton } from "../../_components/PendingSubmitButton";
import { completeOccurrence } from "../actions";

type Props = { occurrenceId: string };

export function CompleteOccurrenceButton({ occurrenceId }: Props) {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await completeOccurrence(occurrenceId);
        router.refresh();
      }}
      className="inline"
    >
      <PendingSubmitButton className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-800 hover:bg-green-100">
        Complete
      </PendingSubmitButton>
    </form>
  );
}
