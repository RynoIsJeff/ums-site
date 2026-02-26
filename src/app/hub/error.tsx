"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Hub Error]", error);
  }, [error]);

  return (
    <div className="hub-content__inner flex min-h-[200px] items-center justify-center">
      <div className="card flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-[var(--ink)]/70">
            An error occurred. Please try again or return to the hub.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="btn-primary"
          >
            Try again
          </button>
          <Link href="/hub" className="btn-outline">
            Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
