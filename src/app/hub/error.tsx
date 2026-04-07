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
          <h2 className="text-lg font-semibold text-(--ink)">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-(--ink)/70">
            An error occurred. Please try again or return to the hub.
          </p>
          <details className="mt-4 max-w-md text-left text-xs text-(--ink)/55">
            <summary className="cursor-pointer text-(--ink)/65 hover:text-(--ink)">
              Hosting: database pool / Vercel
            </summary>
            <p className="mt-2 leading-relaxed">
              Repeated crashes when opening Hub pages are often{" "}
              <strong>Supabase Session pooler</strong> limits on Vercel (error{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-[10px]">
                MaxClientsInSessionMode
              </code>
              ). Set{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-[10px]">DATABASE_URL</code>{" "}
              to the <strong>Transaction</strong> pooler (port{" "}
              <strong>6543</strong>), not <strong>Session</strong> (5432), and add{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-[10px]">
                ?pgbouncer=true&amp;connection_limit=1
              </code>
              . See the repo <code className="text-[10px]">README.md</code> (Supabase + Vercel).
            </p>
          </details>
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
