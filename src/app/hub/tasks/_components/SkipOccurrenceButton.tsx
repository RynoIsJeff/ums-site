"use client";

import { useRouter } from "next/navigation";
import { skipOccurrence } from "../actions";

type Props = { occurrenceId: string };

export function SkipOccurrenceButton({ occurrenceId }: Props) {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await skipOccurrence(occurrenceId);
        router.refresh();
      }}
      className="inline"
    >
      <button
        type="submit"
        className="ml-1 rounded-md border border-black/15 px-2 py-1 text-xs text-black/60 hover:bg-black/5"
      >
        Skip
      </button>
    </form>
  );
}
